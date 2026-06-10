// ps_merge_pro.jsx — Multi-direction document merge with batching for AE
// Compatible: Photoshop CS6+  |  #target photoshop
#target photoshop

(function () {
    if (!app) return;
    var savedUnits = app.preferences.rulerUnits;
    app.preferences.rulerUnits = Units.PIXELS;
    app.displayDialogs = DialogModes.NO;

    // ── Constants ────────────────────────────────────────────────────────────
    var PS_MAX_PX  = 300000;
    var DIRECTIONS = [
        { id: "TB", arrow: "\u2193", label: "Top \u2192 Bottom",  desc: "Stack vertically, first doc on top"    },
        { id: "BT", arrow: "\u2191", label: "Bottom \u2192 Top",  desc: "Stack vertically, first doc on bottom" },
        { id: "LR", arrow: "\u2192", label: "Left \u2192 Right",  desc: "Arrange side by side, first at left"   },
        { id: "RL", arrow: "\u2190", label: "Right \u2192 Left",  desc: "Arrange side by side, first at right"  }
    ];

    // ── Source selection: file picker → fallback to open docs ────────────────
    var useFiles = true;
    var files = File.openDialog(
        "Select images to merge (multi-select; Cancel to use open documents)",
        "*.jpg;*.jpeg;*.png;*.tif;*.tiff;*.psd", true
    );

    var meta = []; // { file|null, name, w, h }

    if (files && files.length > 0) {
        // Sort alphabetically by filename
        files.sort(function (a, b) {
            var an = decodeURI(a.name).toLowerCase();
            var bn = decodeURI(b.name).toLowerCase();
            return an < bn ? -1 : an > bn ? 1 : 0;
        });
        // Pre-scan dimensions (open + close each, no UI shown)
        for (var i = 0; i < files.length; i++) {
            var d = app.open(files[i]);
            meta.push({ file: files[i], name: decodeURI(files[i].name), w: d.width.as("px"), h: d.height.as("px") });
            d.close(SaveOptions.DONOTSAVECHANGES);
        }
    } else {
        // Use currently open documents
        useFiles = false;
        if (app.documents.length < 2) {
            alert("Open at least 2 documents, or select files via the file picker.");
            app.preferences.rulerUnits = savedUnits; return;
        }
        var openDocs = [];
        for (var j = 0; j < app.documents.length; j++) openDocs.push(app.documents[j]);
        openDocs.sort(function (a, b) { return a.name > b.name ? 1 : -1; });
        for (var k = 0; k < openDocs.length; k++) {
            meta.push({ doc: openDocs[k], name: openDocs[k].name, w: openDocs[k].width.as("px"), h: openDocs[k].height.as("px") });
        }
    }

    if (meta.length === 0) { app.preferences.rulerUnits = savedUnits; return; }

    // ── UI ───────────────────────────────────────────────────────────────────
    var dlg = new Window("dialog", "Merge Pro" + (useFiles ? " \u2014 " + meta.length + " files" : " \u2014 " + meta.length + " open docs"));
    dlg.orientation = "column";
    dlg.alignChildren = ["fill", "top"];
    dlg.spacing = 10;
    dlg.margins = 16;

    // — Direction —
    var dirPanel = dlg.add("panel", undefined, "Merge Direction");
    dirPanel.orientation = "row";
    dirPanel.alignChildren = ["left", "center"];
    dirPanel.margins = [10, 14, 10, 10];
    dirPanel.spacing = 4;

    var selectedDir = 0;
    var dirBtns = [];

    for (var d = 0; d < DIRECTIONS.length; d++) {
        (function (idx) {
            var col = dirPanel.add("group");
            col.orientation = "column";
            col.alignChildren = ["center", "top"];
            col.spacing = 2;
            col.margins = [6, 0, 6, 0];
            var btn = col.add("button", undefined, DIRECTIONS[idx].arrow);
            btn.preferredSize = [52, 40];
            col.add("statictext", undefined, DIRECTIONS[idx].label).justify = "center";
            dirBtns.push(btn);
            btn.onClick = function () {
                selectedDir = idx;
                highlightDir();
                refreshPreview();
            };
        })(d);
    }

    var descSt = dlg.add("statictext", undefined, DIRECTIONS[0].desc);
    descSt.alignment = ["fill", "top"];

    // — Sort order (only shown when using open docs) —
    var sortRow = dlg.add("group");
    sortRow.orientation = "row";
    sortRow.alignChildren = ["left", "center"];
    sortRow.add("statictext", undefined, "Sort:");
    var sortDrop = sortRow.add("dropdownlist", undefined, ["Name A\u2192Z", "Name Z\u2192A", "As opened"]);
    sortDrop.selection = 0;
    sortRow.visible = !useFiles; // file list is already sorted; only relevant for open docs
    sortDrop.onChange = function () {
        if (!useFiles) {
            var si = sortDrop.selection.index;
            if      (si === 0) meta.sort(function (a, b) { return a.name > b.name ?  1 : -1; });
            else if (si === 1) meta.sort(function (a, b) { return a.name < b.name ?  1 : -1; });
            // si === 2: as-opened, no sort
        }
        refreshPreview();
    };

    // — Alignment —
    var alignRow = dlg.add("group");
    alignRow.orientation = "row";
    alignRow.alignChildren = ["left", "center"];
    alignRow.add("statictext", undefined, "Align layers:");
    var alignDrop = alignRow.add("dropdownlist", undefined, ["Start (left / top)", "Center", "End (right / bottom)"]);
    alignDrop.selection = 0;
    alignDrop.onChange = refreshPreview;

    // — Batching —
    var batchPanel = dlg.add("panel", undefined, "Batching  (split into multiple documents)");
    batchPanel.orientation = "row";
    batchPanel.alignChildren = ["left", "center"];
    batchPanel.margins = [10, 14, 10, 10];
    batchPanel.spacing = 6;
    batchPanel.add("statictext", undefined, "Max pages per document:");
    var batchDrop = batchPanel.add("dropdownlist", undefined, ["No limit", "10", "20", "50", "100", "Custom"]);
    batchDrop.selection = 0;
    var batchCustom = batchPanel.add("edittext", undefined, "25");
    batchCustom.characters = 5;
    batchCustom.enabled = false;
    batchDrop.onChange = function () {
        batchCustom.enabled = (batchDrop.selection.index === 5);
        refreshPreview();
    };

    // — Output options —
    var outPanel = dlg.add("panel", undefined, "Output");
    outPanel.orientation = "column";
    outPanel.alignChildren = ["fill", "top"];
    outPanel.margins = [10, 14, 10, 10];
    outPanel.spacing = 4;

    var nameRow = outPanel.add("group");
    nameRow.add("statictext", undefined, "Base name:");
    var nameField = nameRow.add("edittext", undefined, "merge");
    nameField.preferredSize = [180, 22];

    var cbFlatten = outPanel.add("checkbox", undefined, "Flatten each document before saving");
    cbFlatten.value = true;
    var cbSave    = outPanel.add("checkbox", undefined, "Auto-save PSD next to source files (closes docs)");
    cbSave.value  = false;
    cbSave.enabled = useFiles;
    if (!useFiles) {
        var savNote = outPanel.add("statictext", undefined, "  Auto-save requires file picker mode.");
    }

    // — Preview panel —
    var prevPanel = dlg.add("panel", undefined, "Output Preview");
    prevPanel.orientation = "column";
    prevPanel.alignChildren = ["fill", "top"];
    prevPanel.margins = [10, 14, 10, 10];
    prevPanel.spacing = 2;
    var prevText = prevPanel.add("statictext", undefined, "...", { multiline: true });
    prevText.preferredSize = [400, 60];

    // — Buttons —
    var btnRow = dlg.add("group");
    btnRow.orientation = "row";
    btnRow.alignment = ["right", "bottom"];
    btnRow.add("button", undefined, "Cancel", { name: "cancel" }).onClick = function () { dlg.close(0); };
    btnRow.add("button", undefined, "Merge",  { name: "ok"     }).onClick = function () { dlg.close(1); };

    // ── Helpers ──────────────────────────────────────────────────────────────
    function highlightDir() {
        for (var i = 0; i < dirBtns.length; i++) {
            dirBtns[i].text = (i === selectedDir) ? "[" + DIRECTIONS[i].arrow + "]" : DIRECTIONS[i].arrow;
        }
        descSt.text = DIRECTIONS[selectedDir].desc;
    }

    function getBatchSize() {
        var si = batchDrop.selection ? batchDrop.selection.index : 0;
        if (si === 0) return Infinity;
        if (si === 1) return 10;
        if (si === 2) return 20;
        if (si === 3) return 50;
        if (si === 4) return 100;
        var v = parseInt(batchCustom.text, 10);
        return (isNaN(v) || v < 1) ? 10 : v;
    }

    function calcBatches() {
        var dir    = DIRECTIONS[selectedDir].id;
        var isVert = (dir === "TB" || dir === "BT");
        var bs     = getBatchSize();
        var total  = meta.length;
        var count  = (bs === Infinity) ? 1 : Math.ceil(total / bs);
        var batches = [];
        for (var b = 0; b < count; b++) {
            var s = b * (bs === Infinity ? total : bs);
            var e = Math.min(s + (bs === Infinity ? total : bs), total);
            var w = 0, h = 0;
            for (var i = s; i < e; i++) {
                if (isVert) { if (meta[i].w > w) w = meta[i].w; h += meta[i].h; }
                else        { w += meta[i].w; if (meta[i].h > h) h = meta[i].h; }
            }
            batches.push({ start: s, end: e, w: w, h: h, overLimit: (isVert ? h : w) > PS_MAX_PX });
        }
        return batches;
    }

    function refreshPreview() {
        var batches = calcBatches();
        var lines = [];
        var warned = false;
        for (var b = 0; b < batches.length; b++) {
            var bt = batches[b];
            var tag = bt.overLimit ? "  \u26A0 EXCEEDS 300k px limit!" : "";
            lines.push("Doc " + (b + 1) + ": pages " + (bt.start + 1) + "\u2013" + bt.end +
                       "  \u2192  " + bt.w + " \xD7 " + bt.h + " px" + tag);
            if (bt.overLimit) warned = true;
        }
        if (warned) lines.push("Reduce batch size to fix \u26A0 documents.");
        prevText.text = lines.join("\n");
    }

    highlightDir();
    refreshPreview();

    var result = dlg.show();
    if (result !== 1) { app.preferences.rulerUnits = savedUnits; return; }

    // ── Validate ─────────────────────────────────────────────────────────────
    var finalBatchSize = getBatchSize();
    var batchCount = (finalBatchSize === Infinity) ? 1 : Math.ceil(meta.length / finalBatchSize);
    var baseName  = nameField.text || "merge";
    var dir       = DIRECTIONS[selectedDir].id;
    var isVert    = (dir === "TB" || dir === "BT");
    var alignIdx  = alignDrop.selection ? alignDrop.selection.index : 0;
    var doFlatten = cbFlatten.value;
    var doSave    = cbSave.value && useFiles;
    var srcFolder = useFiles ? files[0].parent : null;

    // Reverse order for BT/RL
    var orderedMeta = meta.slice();
    if (dir === "BT" || dir === "RL") orderedMeta.reverse();

    // ── Merge loops ──────────────────────────────────────────────────────────
    for (var b = 0; b < batchCount; b++) {
        var pbs   = finalBatchSize === Infinity ? orderedMeta.length : finalBatchSize;
        var start = b * pbs;
        var end   = Math.min(start + pbs, orderedMeta.length);
        var batch = orderedMeta.slice(start, end);

        var canvasW = 0, canvasH = 0;
        for (var m = 0; m < batch.length; m++) {
            if (isVert) { if (batch[m].w > canvasW) canvasW = batch[m].w; canvasH += batch[m].h; }
            else        { canvasW += batch[m].w; if (batch[m].h > canvasH) canvasH = batch[m].h; }
        }

        // Skip over-limit batches (already warned in preview)
        if ((isVert ? canvasH : canvasW) > PS_MAX_PX) {
            alert("Skipping doc " + (b + 1) + ": canvas exceeds " + PS_MAX_PX + " px.\nReduce batch size.");
            continue;
        }

        var docLabel = batchCount > 1
            ? baseName + "_" + pad(start + 1) + "-" + pad(end)
            : baseName;
        var target = app.documents.add(
            new UnitValue(canvasW, "px"), new UnitValue(canvasH, "px"),
            72, docLabel, NewDocumentMode.RGB, DocumentFill.WHITE
        );

        var cursor = 0;

        for (var k = 0; k < batch.length; k++) {
            var item = batch[k];

            // Open/copy source
            if (useFiles) {
                var srcDoc = app.open(item.file);
                srcDoc.selection.selectAll();
                try { srcDoc.selection.copy(true); } catch (e) { srcDoc.selection.copy(); }
                srcDoc.close(SaveOptions.DONOTSAVECHANGES);
            } else {
                app.activeDocument = item.doc;
                item.doc.selection.selectAll();
                try { item.doc.selection.copy(true); } catch (e) { item.doc.selection.copy(); }
                item.doc.selection.deselect();
            }

            app.activeDocument = target;
            var layer = target.paste();
            layer.name = item.name.replace(/\.[^.]+$/, "");

            var bnds   = layer.bounds;
            var curL   = bnds[0].as("px"), curT = bnds[1].as("px");
            var layerW = bnds[2].as("px") - curL;
            var layerH = bnds[3].as("px") - curT;

            var targetX, targetY;
            if (isVert) {
                if      (alignIdx === 0) targetX = 0;
                else if (alignIdx === 1) targetX = Math.round((canvasW - layerW) / 2);
                else                    targetX = canvasW - layerW;
                targetY = cursor;
                cursor += item.h;
            } else {
                if      (alignIdx === 0) targetY = 0;
                else if (alignIdx === 1) targetY = Math.round((canvasH - layerH) / 2);
                else                    targetY = canvasH - layerH;
                targetX = cursor;
                cursor += item.w;
            }

            layer.translate(
                new UnitValue(targetX - curL, "px"),
                new UnitValue(targetY - curT, "px")
            );
        }

        if (doFlatten) target.flatten();

        if (doSave && srcFolder) {
            var psdOpts = new PhotoshopSaveOptions();
            psdOpts.embedColorProfile = true;
            psdOpts.maximizeCompatibility = true;
            target.saveAs(new File(srcFolder + "/" + docLabel + ".psd"), psdOpts, true);
            target.close(SaveOptions.DONOTSAVECHANGES);
        }
    }

    app.preferences.rulerUnits = savedUnits;
    alert("Done. " + batchCount + " document(s) created.");

    function pad(n) { return (n < 10 ? "00" : n < 100 ? "0" : "") + n; }

})();
