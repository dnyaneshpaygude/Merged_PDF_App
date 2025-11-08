# PDF Tools - Ultimate PDF Manager

A beautiful, modern web application built with Flask and Python for performing various PDF operations. This application provides an intuitive user interface for common PDF tasks.

## Features

- **Merge PDFs**: Combine multiple PDF files into one document
- **Split PDF**: Split a PDF into individual pages
- **Extract Text**: Extract all text content from PDF documents
- **Rotate PDF**: Rotate PDF pages by 90°, 180°, or 270°
- **Compress PDF**: Reduce PDF file size while maintaining quality
- **Extract Pages**: Extract specific pages from a PDF document
- **Images to PDF**: Convert multiple images into a single PDF

## Requirements

- Python 3.8 or higher
- pip (Python package manager)

## Installation

1. Clone or download this repository

2. Install the required dependencies:
```bash
pip install -r requirements.txt
```

## Running the Application

1. Start the Flask server:
```bash
python app.py
```

2. Open your web browser and navigate to:
```
http://localhost:5000
```

The application will be running on `http://0.0.0.0:5000` (accessible from all network interfaces).

## Usage

1. **Merge PDFs**: 
   - Navigate to the Merge page
   - Select 2 or more PDF files
   - Click "Merge PDFs" to download the merged file

2. **Split PDF**:
   - Navigate to the Split page
   - Select a PDF file
   - Click "Split PDF" to download a ZIP file containing all pages

3. **Extract Text**:
   - Navigate to the Extract Text page
   - Select a PDF file
   - Click "Extract Text" to view the extracted text

4. **Rotate PDF**:
   - Navigate to the Rotate page
   - Select a PDF file
   - Choose rotation angle (90°, 180°, or 270°)
   - Click "Rotate PDF" to download the rotated file

5. **Compress PDF**:
   - Navigate to the Compress page
   - Select a PDF file
   - Click "Compress PDF" to download the compressed file

6. **Extract Pages**:
   - Navigate to the Extract Pages page
   - Select a PDF file
   - Enter page numbers (e.g., "1,3,5-7" or "1-5")
   - Click "Extract Pages" to download the extracted pages

7. **Images to PDF**:
   - Navigate to the Images to PDF page
   - Select one or more image files (PNG, JPG, JPEG)
   - Click "Convert to PDF" to download the PDF

## File Size Limits

- Maximum file size: 50MB per file
- Supported formats: PDF, PNG, JPG, JPEG

## Technologies Used

- **Backend**: Flask (Python web framework)
- **PDF Processing**: PyPDF2
- **PDF Generation**: ReportLab
- **Image Processing**: Pillow (PIL)
- **Frontend**: HTML5, CSS3, JavaScript
- **UI Framework**: Custom CSS with modern design principles

## Project Structure

```
.
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── README.md             # This file
├── static/               # Static files (CSS, JS)
│   ├── style.css        # Application styles
│   └── script.js        # Client-side JavaScript
├── templates/            # HTML templates
│   ├── base.html        # Base template
│   ├── index.html       # Home page
│   ├── merge.html       # Merge PDFs page
│   ├── split.html       # Split PDF page
│   ├── extract_text.html # Extract text page
│   ├── rotate.html      # Rotate PDF page
│   ├── compress.html    # Compress PDF page
│   ├── extract_pages.html # Extract pages page
│   └── images_to_pdf.html # Images to PDF page
└── uploads/              # Upload directory (created automatically)
```

## Features

- Modern, responsive UI design
- Drag and drop file upload
- Real-time file preview
- Loading indicators
- Error handling and user feedback
- Mobile-friendly interface

## License

This project is open source and available for personal and commercial use.

## Notes

- Files are processed in memory and not stored permanently on the server
- The application runs in debug mode by default (change in `app.py` for production)
- Make sure to set a secure `SECRET_KEY` in production environments

