from flask import Flask, render_template, request, send_file, jsonify, flash, redirect, url_for
from werkzeug.utils import secure_filename
import os
import io
from PyPDF2 import PdfReader, PdfWriter
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from PIL import Image
import zipfile
import tempfile

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key-here'
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
app.config['ALLOWED_EXTENSIONS'] = {'pdf', 'png', 'jpg', 'jpeg'}

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in app.config['ALLOWED_EXTENSIONS']

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/merge', methods=['GET', 'POST'])
def merge_pdfs():
    if request.method == 'POST':
        files = request.files.getlist('files')
        if len(files) < 2:
            return jsonify({'error': 'Please upload at least 2 PDF files'}), 400
        
        pdf_writer = PdfWriter()
        
        for file in files:
            if file and allowed_file(file.filename) and file.filename.endswith('.pdf'):
                file.seek(0)
                pdf_reader = PdfReader(file)
                for page in pdf_reader.pages:
                    pdf_writer.add_page(page)
        
        output = io.BytesIO()
        pdf_writer.write(output)
        output.seek(0)
        
        return send_file(output, mimetype='application/pdf', 
                        as_attachment=True, download_name='merged.pdf')
    
    return render_template('merge.html')

@app.route('/split', methods=['GET', 'POST'])
def split_pdf():
    if request.method == 'POST':
        file = request.files.get('file')
        if not file or not allowed_file(file.filename):
            return jsonify({'error': 'Please upload a valid PDF file'}), 400
        
        file.seek(0)
        pdf_reader = PdfReader(file)
        total_pages = len(pdf_reader.pages)
        
        # Create a zip file with all pages
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
            for page_num in range(total_pages):
                pdf_writer = PdfWriter()
                pdf_writer.add_page(pdf_reader.pages[page_num])
                
                page_buffer = io.BytesIO()
                pdf_writer.write(page_buffer)
                page_buffer.seek(0)
                
                zip_file.writestr(f'page_{page_num + 1}.pdf', page_buffer.read())
        
        zip_buffer.seek(0)
        return send_file(zip_buffer, mimetype='application/zip',
                        as_attachment=True, download_name='split_pages.zip')
    
    return render_template('split.html')

@app.route('/extract-text', methods=['GET', 'POST'])
def extract_text():
    if request.method == 'POST':
        file = request.files.get('file')
        if not file or not allowed_file(file.filename):
            return jsonify({'error': 'Please upload a valid PDF file'}), 400
        
        file.seek(0)
        pdf_reader = PdfReader(file)
        text = ""
        
        for page in pdf_reader.pages:
            text += page.extract_text() + "\n\n"
        
        return jsonify({'text': text})
    
    return render_template('extract_text.html')

@app.route('/rotate', methods=['GET', 'POST'])
def rotate_pdf():
    if request.method == 'POST':
        file = request.files.get('file')
        angle = int(request.form.get('angle', 90))
        
        if not file or not allowed_file(file.filename):
            return jsonify({'error': 'Please upload a valid PDF file'}), 400
        
        file.seek(0)
        pdf_reader = PdfReader(file)
        pdf_writer = PdfWriter()
        
        for page in pdf_reader.pages:
            rotated_page = page.rotate(angle)
            pdf_writer.add_page(rotated_page)
        
        output = io.BytesIO()
        pdf_writer.write(output)
        output.seek(0)
        
        return send_file(output, mimetype='application/pdf',
                        as_attachment=True, download_name='rotated.pdf')
    
    return render_template('rotate.html')

@app.route('/compress', methods=['GET', 'POST'])
def compress_pdf():
    if request.method == 'POST':
        file = request.files.get('file')
        if not file or not allowed_file(file.filename):
            return jsonify({'error': 'Please upload a valid PDF file'}), 400
        
        file.seek(0)
        pdf_reader = PdfReader(file)
        pdf_writer = PdfWriter()
        
        for page in pdf_reader.pages:
            pdf_writer.add_page(page)
        
        # Compress by removing unnecessary objects
        pdf_writer.compress_identical_objects()
        
        output = io.BytesIO()
        pdf_writer.write(output)
        output.seek(0)
        
        return send_file(output, mimetype='application/pdf',
                        as_attachment=True, download_name='compressed.pdf')
    
    return render_template('compress.html')

@app.route('/extract-pages', methods=['GET', 'POST'])
def extract_pages():
    if request.method == 'POST':
        file = request.files.get('file')
        pages = request.form.get('pages', '')
        
        if not file or not allowed_file(file.filename):
            return jsonify({'error': 'Please upload a valid PDF file'}), 400
        
        if not pages:
            return jsonify({'error': 'Please specify pages to extract'}), 400
        
        # Parse page numbers (e.g., "1,3,5-7" or "1-5")
        page_numbers = []
        for part in pages.split(','):
            part = part.strip()
            if '-' in part:
                start, end = map(int, part.split('-'))
                page_numbers.extend(range(start - 1, end))  # Convert to 0-indexed
            else:
                page_numbers.append(int(part) - 1)  # Convert to 0-indexed
        
        file.seek(0)
        pdf_reader = PdfReader(file)
        pdf_writer = PdfWriter()
        
        for page_num in page_numbers:
            if 0 <= page_num < len(pdf_reader.pages):
                pdf_writer.add_page(pdf_reader.pages[page_num])
        
        output = io.BytesIO()
        pdf_writer.write(output)
        output.seek(0)
        
        return send_file(output, mimetype='application/pdf',
                        as_attachment=True, download_name='extracted_pages.pdf')
    
    return render_template('extract_pages.html')

@app.route('/images-to-pdf', methods=['GET', 'POST'])
def images_to_pdf():
    if request.method == 'POST':
        files = request.files.getlist('files')
        if not files or len(files) == 0:
            return jsonify({'error': 'Please upload at least one image file'}), 400
        
        pdf_writer = PdfWriter()
        
        for file in files:
            if file and allowed_file(file.filename):
                file.seek(0)
                try:
                    img = Image.open(file)
                    # Convert RGBA to RGB if necessary
                    if img.mode == 'RGBA':
                        rgb_img = Image.new('RGB', img.size, (255, 255, 255))
                        rgb_img.paste(img, mask=img.split()[3])
                        img = rgb_img
                    
                    # Save image to temporary file
                    temp_img = tempfile.NamedTemporaryFile(delete=False, suffix='.jpg')
                    img.save(temp_img.name, 'JPEG', quality=95)
                    temp_img.close()
                    
                    # Create PDF page from image
                    pdf_buffer = io.BytesIO()
                    c = canvas.Canvas(pdf_buffer, pagesize=letter)
                    width, height = letter
                    img_width, img_height = img.size
                    
                    # Scale image to fit page
                    scale = min(width / img_width, height / img_height)
                    new_width = img_width * scale
                    new_height = img_height * scale
                    x = (width - new_width) / 2
                    y = (height - new_height) / 2
                    
                    c.drawImage(temp_img.name, x, y, width=new_width, height=new_height)
                    c.save()
                    pdf_buffer.seek(0)
                    
                    # Add to main PDF
                    img_pdf = PdfReader(pdf_buffer)
                    pdf_writer.add_page(img_pdf.pages[0])
                    
                    os.unlink(temp_img.name)
                except Exception as e:
                    return jsonify({'error': f'Error processing image: {str(e)}'}), 400
        
        output = io.BytesIO()
        pdf_writer.write(output)
        output.seek(0)
        
        return send_file(output, mimetype='application/pdf',
                        as_attachment=True, download_name='images_to_pdf.pdf')
    
    return render_template('images_to_pdf.html')

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)

