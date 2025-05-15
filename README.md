# Image Annotator Library

The `image-annotator-lib` is a JavaScript library for annotating images. It allows users to add points with descriptions, interact with points, and export the annotated image.

---

## API Reference

### Constructor
```javascript
const annotator = new Annotator(imageUrl, onPointAdded, initialPoints);
```
- **`imageUrl`** (string): The URL of the image to annotate.
- **`onPointAdded`** (function): Callback triggered when a point is added.
- **`initialPoints`** (array): Array of predefined points, each with `id`, `x`, `y`, and `data`.

### Methods
- **`addPoint(x, y, data)`**: Add a new point to the image.
  - `x` (number): X-coordinate of the point.
  - `y` (number): Y-coordinate of the point.
  - `data` (string): Description or additional data for the point.
- **`deletePoint(pointId)`**: Delete a point by its ID.
  - `pointId` (number): The ID of the point to delete.
- **`exportImage()`**: Export the annotated image as a data URL.

### Callbacks
- **`onPointAdded(point, points)`**: Triggered when a point is added.
  - `point` (object): The newly added point.
  - `points` (array): The updated list of all points.
- **`onPointClicked(point)`**: Triggered when a point is clicked.
  - `point` (object): The clicked point.

---

## Example Usage (CDN)

Include the library in your project using a CDN:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Image Annotator Example</title>
</head>
<body>
  <h1>Image Annotator Example</h1>
  <div id="points-container">
    <h2>Collected Points:</h2>
    <table>
      <thead>
        <tr>
          <th>#</th>
          <th>X Coordinate</th>
          <th>Y Coordinate</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody id="points-table-body"></tbody>
    </table>
  </div>
  <button id="export-button">Export Image</button>

  <script src="https://cdn.example.com/image-annotator-lib.js"></script>
  <script>
    const Annotator = ImageAnnotatorLib.Annotator;

    const annotator = new Annotator('https://example.com/image.png', null, [
      { id: 1, x: 50, y: 50, data: 'Point 1' },
      { id: 2, x: 150, y: 100, data: 'Point 2' }
    ]);

    annotator.onPointAdded = (point, points) => {
      console.log('Point added:', point);
    };

    annotator.onPointClicked = (point) => {
      console.log('Point clicked:', point);
    };

    document.getElementById('export-button').addEventListener('click', async () => {
      const exportedImage = await annotator.exportImage();
      console.log('Exported Image URL:', exportedImage);
    });
  </script>
</body>
</html>