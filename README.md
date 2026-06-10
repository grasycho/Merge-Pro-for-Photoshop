# Merge Pro for Photoshop

A powerful Photoshop script for merging multiple images or documents into large composite documents with support for vertical/horizontal layouts, alignment controls, batching, automatic PSD export, and After Effects workflows.

---

# Overview

Merge Pro is an Adobe Photoshop ExtendScript (`.jsx`) that combines multiple images into one or more large Photoshop documents.

The script is designed for workflows involving:

* Image sequence assembly
* Long screenshots
* Storyboards
* Contact sheets
* Manga/Webtoon pages
* Motion graphics pipelines
* After Effects asset preparation
* Large-scale image stitching

Unlike manual layer arrangement, Merge Pro automatically calculates canvas sizes, aligns layers, batches oversized projects, and optionally exports PSD files.

---

# Features

## Multiple Merge Directions

Arrange images in four different directions.

### Top → Bottom

```text
Image 1
Image 2
Image 3
```

### Bottom → Top

```text
Image 3
Image 2
Image 1
```

### Left → Right

```text
Image 1 | Image 2 | Image 3
```

### Right → Left

```text
Image 3 | Image 2 | Image 1
```

---

## File Picker Mode

Select multiple files directly from disk.

Supported formats:

* JPG
* JPEG
* PNG
* PSD
* TIF
* TIFF

Files are automatically sorted alphabetically before processing.

---

## Open Document Mode

If no files are selected, the script can use currently open Photoshop documents.

Useful when:

* Working with edited PSDs
* Rearranging existing projects
* Combining active documents

---

## Automatic Sorting

When using open documents, the merge order can be changed.

Available options:

* Name A → Z
* Name Z → A
* As Opened

---

## Layer Alignment Controls

Control how images are aligned within the merged canvas.

### Vertical Merges

Options:

* Left aligned
* Center aligned
* Right aligned

### Horizontal Merges

Options:

* Top aligned
* Center aligned
* Bottom aligned

---

## Smart Canvas Calculation

The script automatically calculates the required document dimensions.

For vertical merges:

```text
Width  = widest image
Height = sum of all image heights
```

For horizontal merges:

```text
Width  = sum of all image widths
Height = tallest image
```

---

## Batch Processing

Large projects can be split into multiple output documents.

Available presets:

* No Limit
* 10 pages
* 20 pages
* 50 pages
* 100 pages
* Custom

Example:

```text
120 images
Batch size: 50

Output:
merge_001-050.psd
merge_051-100.psd
merge_101-120.psd
```

---

## Photoshop Canvas Limit Protection

Photoshop has practical document size limitations.

Merge Pro automatically checks for oversized outputs and warns before processing.

Maximum monitored dimension:

```text
300,000 pixels
```

Oversized batches are skipped to prevent failures.

---

## Live Output Preview

The interface displays a real-time preview of the generated documents.

Example:

```text
Doc 1: pages 1–50   →  1080 × 50000 px
Doc 2: pages 51–100 →  1080 × 50000 px
Doc 3: pages 101–120 → 1080 × 20000 px
```

Warnings appear automatically when size limits are exceeded.

---

## Automatic Layer Naming

Imported layers are named using source filenames.

Example:

```text
background.png
character.png
effects.png
```

becomes:

```text
Background
Character
Effects
```

inside the merged document.

---

## Optional Flattening

After merging, documents can be automatically flattened.

Benefits:

* Smaller PSD sizes
* Faster saving
* Better compatibility with other applications

Ideal for final delivery files.

---

## Automatic PSD Export

Optionally save merged documents automatically.

Features:

* PSD output
* Embedded color profile
* Maximum compatibility enabled
* Saves next to source files
* Can automatically close generated documents

---

## After Effects Friendly Workflow

The script was designed with AE pipelines in mind.

Common use cases:

* Storyboard strips
* Vertical webtoon exports
* Texture atlases
* Sequence assembly
* Large background sheets
* Animation references

---

# User Interface

## Merge Direction

Choose one of four layouts:

| Direction    | Description              |
| ------------ | ------------------------ |
| Top → Bottom | Stack vertically         |
| Bottom → Top | Reverse vertical order   |
| Left → Right | Arrange horizontally     |
| Right → Left | Reverse horizontal order |

---

## Sort Order

Available when using open Photoshop documents.

| Option    | Description          |
| --------- | -------------------- |
| Name A→Z  | Alphabetical         |
| Name Z→A  | Reverse alphabetical |
| As Opened | Preserve open order  |

---

## Alignment

| Option | Behavior         |
| ------ | ---------------- |
| Start  | Left or top      |
| Center | Center alignment |
| End    | Right or bottom  |

---

## Batching

Split large jobs into multiple documents.

Example:

```text
500 images
Batch size = 100

Output:
5 PSD files
```

---

## Output Options

### Base Name

Controls output filenames.

Example:

```text
Project
```

Produces:

```text
Project.psd
Project_001-050.psd
Project_051-100.psd
```

---

### Flatten Before Save

Flattens the merged document before export.

---

### Auto Save PSD

Automatically saves generated PSD files to the source folder.

---

# Installation

## Temporary Usage

1. Open Photoshop.
2. Go to:

```text
File → Scripts → Browse...
```

3. Select:

```text
ps_merge_pro.jsx
```

4. Run the script.

---

## Permanent Installation

Copy the script into:

```text
Adobe Photoshop/
└── Presets/
    └── Scripts/
        └── ps_merge_pro.jsx
```

Restart Photoshop.

The script will then appear under:

```text
File → Scripts
```

---

# Typical Workflows

## Create a Long Vertical Document

1. Export multiple screenshots.
2. Select all files.
3. Choose Top → Bottom.
4. Click Merge.

Result:

```text
One continuous vertical image
```

---

## Build a Storyboard Strip

1. Select storyboard frames.
2. Choose Left → Right.
3. Merge.

Result:

```text
Frame 1 | Frame 2 | Frame 3 | Frame 4
```

---

## Webtoon Assembly

1. Select episode panels.
2. Choose Top → Bottom.
3. Enable batching if needed.
4. Merge.

Result:

```text
Multiple PSDs sized for publishing
```

---

## Combine Open PSD Documents

1. Open multiple PSD files.
2. Launch the script.
3. Cancel file selection.
4. Choose sorting and alignment.
5. Merge.

Result:

```text
Single combined Photoshop document
```

---

# Technical Details

The script automatically:

* Reads image dimensions
* Calculates output canvas sizes
* Opens source files
* Copies merged image data
* Creates new documents
* Aligns layers
* Preserves image order
* Saves PSD outputs
* Handles batching

No external plugins or dependencies are required.

---

# Requirements

* Adobe Photoshop CS6 or newer
* ExtendScript support
* Sufficient RAM for large composites

Recommended:

* Photoshop CC 2020+
* Photoshop 2021+
* Photoshop 2022+
* Photoshop 2023+
* Photoshop 2024+
* Photoshop 2025+

---

# Limitations

* Imports raster content only
* Does not preserve layer structures from source PSDs
* Uses flattened copy/paste operations
* Extremely large projects may require batching
* PSD export is available only in file-picker mode

---

# Version

**Merge Pro**

Multi-direction image and document merger with batching support for large Photoshop and After Effects workflows.

---

# License

Use, modify, and distribute according to the license chosen for this repository.
