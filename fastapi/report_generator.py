from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, ListItem, ListFlowable
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from datetime import datetime
import os

def generate_medical_report_pdf(patient_name, disease, description, precautions, filename=None):
    reports_folder = "reports"
    os.makedirs(reports_folder, exist_ok=True)  # creates folder if not present
    
    # Create a filename with patient name if not specified
    if filename is None:
        # Replace spaces with underscores and remove special characters
        safe_name = ''.join(c if c.isalnum() or c == ' ' else '_' for c in patient_name).replace(' ', '_')
        # Add date to make it unique
        current_date = datetime.now().strftime("%Y%m%d")
        filename = f"{safe_name}_{current_date}_medical_report.pdf"
    
    # Create document
    full_path = os.path.join(reports_folder, filename)
    
    doc = SimpleDocTemplate(full_path, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Create custom styles
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=16,
        alignment=1,  # Center alignment
        spaceAfter=12
    )
    
    heading_style = ParagraphStyle(
        'Heading',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.navy,
        spaceAfter=6
    )
    
    normal_style = ParagraphStyle(
        'Normal',
        parent=styles['Normal'],
        fontSize=12,
        spaceAfter=6
    )
    
    # Content elements
    content = []
    
    # Add header and date
    content.append(Paragraph("MEDICAL DIAGNOSIS REPORT", title_style))
    content.append(Spacer(1, 12))
    
    current_date = datetime.now().strftime("%B %d, %Y")
    content.append(Paragraph(f"Report Date: {current_date}", normal_style))
    content.append(Paragraph(f"Patient Name: {patient_name}", normal_style))
    content.append(Spacer(1, 12))
    
    # Add diagnosis
    content.append(Paragraph("DIAGNOSIS", heading_style))
    content.append(Paragraph(f"Condition: {disease}", normal_style))
    content.append(Paragraph("Description:", normal_style))
    content.append(Paragraph(description, normal_style))
    content.append(Spacer(1, 12))
    
    # Add precautions
    content.append(Paragraph("RECOMMENDED PRECAUTIONS", heading_style))
    
    precaution_items = []
    for i, precaution in enumerate(precautions):
        precaution_items.append(ListItem(Paragraph(precaution, normal_style)))
    
    precaution_list = ListFlowable(
        precaution_items,
        bulletType='bullet',
        leftIndent=20
    )
    content.append(precaution_list)
    content.append(Spacer(1, 12))
    
    # Disclaimer
    content.append(Paragraph("DISCLAIMER", heading_style))
    disclaimer_text = "This report is generated based on symptoms provided and is not a substitute for professional medical advice. Please consult with a healthcare professional for proper diagnosis and treatment."
    content.append(Paragraph(disclaimer_text, normal_style))
    
    
    # Build PDF
    doc.build(content)
    return full_path

def save_diagnosis_as_pdf(disease, description, precautions, patient_name=None):
    # Get patient name if not provided
    if patient_name is None:
        patient_name = input("Enter patient name for the report: ")
    
    # Generate PDF
    pdf_file = generate_medical_report_pdf(
        patient_name=patient_name,
        disease=disease,
        description=description,
        precautions=precautions
    )
    
    
    
    print(f"Medical report saved as '{pdf_file}'")
    return pdf_file