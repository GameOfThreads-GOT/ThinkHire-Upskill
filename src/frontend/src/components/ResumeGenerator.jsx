import { useState } from 'react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const ResumeGenerator = ({ onResumeGenerated, userDetails }) => {
  const [resumeData, setResumeData] = useState({
    fullName: userDetails?.name || '',
    email: userDetails?.email || '',
    phone: '',
    location: '',
    summary: '',
    experience: [{ company: '', position: '', duration: '', description: '' }],
    education: [{ school: '', degree: '', field: '', year: '' }],
    skills: ''
  });

  const [showPreview, setShowPreview] = useState(false);

  // ---------------------------
  // FORM HANDLERS
  // ---------------------------

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setResumeData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExperienceChange = (index, field, value) => {
    const updatedExperience = [...resumeData.experience];
    updatedExperience[index][field] = value;
    setResumeData(prev => ({
      ...prev,
      experience: updatedExperience
    }));
  };

  const handleEducationChange = (index, field, value) => {
    const updatedEducation = [...resumeData.education];
    updatedEducation[index][field] = value;
    setResumeData(prev => ({
      ...prev,
      education: updatedEducation
    }));
  };

  const addExperience = () => {
    setResumeData(prev => ({
      ...prev,
      experience: [...prev.experience, { company: '', position: '', duration: '', description: '' }]
    }));
  };

  const removeExperience = (index) => {
    setResumeData(prev => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index)
    }));
  };

  const addEducation = () => {
    setResumeData(prev => ({
      ...prev,
      education: [...prev.education, { school: '', degree: '', field: '', year: '' }]
    }));
  };

  const removeEducation = (index) => {
    setResumeData(prev => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index)
    }));
  };

  const handleGenerateResume = () => {
    if (!resumeData.fullName || !resumeData.email) {
      alert('Please fill in at least name and email');
      return;
    }
    onResumeGenerated(resumeData);
  };

  // ---------------------------
  // PDF GENERATOR
  // ---------------------------

  const downloadResume = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    
    // Set document properties
    doc.setProperties({
      title: `${resumeData.fullName} - Resume`,
      subject: 'Professional Resume',
      author: resumeData.fullName,
      keywords: 'resume, cv, professional',
      creator: 'ThinkHire Resume Generator'
    });
    
    // Add header with a line
    doc.setDrawColor(206, 66, 43); // Rust primary color
    doc.setLineWidth(0.5);
    doc.line(margin, 35, pageWidth - margin, 35);
    
    // Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(0, 0, 0);
    doc.text(resumeData.fullName, margin, 25);
    
    // Contact Information
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    const contactInfo = [
      resumeData.email,
      resumeData.phone,
      resumeData.location
    ].filter(info => info).join(' | ');
    
    if (contactInfo) {
      doc.text(contactInfo, margin, 32);
    }
    
    let yPos = 45;
    
    // Summary Section
    if (resumeData.summary) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('SUMMARY', margin, yPos);
      yPos += 2;
      
      // Add underline
      doc.setDrawColor(212, 165, 116); // Rust border color
      doc.setLineWidth(0.2);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const splitSummary = doc.splitTextToSize(resumeData.summary, contentWidth);
      doc.text(splitSummary, margin, yPos);
      yPos += splitSummary.length * 6 + 5;
    }
    
    // Experience Section
    if (resumeData.experience.some(exp => exp.company)) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('EXPERIENCE', margin, yPos);
      yPos += 2;
      
      // Add underline
      doc.setDrawColor(212, 165, 116); // Rust border color
      doc.setLineWidth(0.2);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 7;
      
      doc.setFont('helvetica', 'normal');
      
      resumeData.experience.forEach(exp => {
        if (exp.company) {
          // Check if we need a new page
          if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 20;
          }
          
          // Position and company
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text(`${exp.position}`, margin, yPos);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(100, 100, 100);
          doc.text(`${exp.company}, ${exp.duration}`, margin, yPos + 5);
          
          // Description
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          const splitDesc = doc.splitTextToSize(exp.description, contentWidth);
          doc.text(splitDesc, margin, yPos + 12);
          
          yPos += splitDesc.length * 6 + 15;
        }
      });
    }
    
    // Education Section
    if (resumeData.education.some(edu => edu.school)) {
      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('EDUCATION', margin, yPos);
      yPos += 2;
      
      // Add underline
      doc.setDrawColor(212, 165, 116); // Rust border color
      doc.setLineWidth(0.2);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 7;
      
      doc.setFont('helvetica', 'normal');
      
      resumeData.education.forEach(edu => {
        if (edu.school) {
          // Check if we need a new page
          if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text(`${edu.degree} in ${edu.field}`, margin, yPos);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(100, 100, 100);
          doc.text(`${edu.school}, ${edu.year}`, margin, yPos + 5);
          
          yPos += 15;
        }
      });
    }
    
    // Skills Section
    if (resumeData.skills) {
      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('SKILLS', margin, yPos);
      yPos += 2;
      
      // Add underline
      doc.setDrawColor(212, 165, 116); // Rust border color
      doc.setLineWidth(0.2);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const splitSkills = doc.splitTextToSize(resumeData.skills, contentWidth);
      doc.text(splitSkills, margin, yPos);
      yPos += splitSkills.length * 6 + 5;
    }
    
    // Add footer with page number
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, pageHeight - 10);
    }
    
    doc.save(`${resumeData.fullName.replace(/\s+/g, '_')}_Resume.pdf`);
  };

  // --------------------------------------------------
  // NEW: Save PDF to server
  // --------------------------------------------------

  const uploadPdfToServer = async () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    
    // Set document properties
    doc.setProperties({
      title: `${resumeData.fullName} - Resume`,
      subject: 'Professional Resume',
      author: resumeData.fullName,
      keywords: 'resume, cv, professional',
      creator: 'ThinkHire Resume Generator'
    });
    
    // Add header with a line
    doc.setDrawColor(206, 66, 43); // Rust primary color
    doc.setLineWidth(0.5);
    doc.line(margin, 35, pageWidth - margin, 35);
    
    // Name
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(28);
    doc.setTextColor(0, 0, 0);
    doc.text(resumeData.fullName, margin, 25);
    
    // Contact Information
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.setTextColor(100, 100, 100);
    const contactInfo = [
      resumeData.email,
      resumeData.phone,
      resumeData.location
    ].filter(info => info).join(' | ');
    
    if (contactInfo) {
      doc.text(contactInfo, margin, 32);
    }
    
    let yPos = 45;
    
    // Summary Section
    if (resumeData.summary) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('SUMMARY', margin, yPos);
      yPos += 2;
      
      // Add underline
      doc.setDrawColor(212, 165, 116); // Rust border color
      doc.setLineWidth(0.2);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const splitSummary = doc.splitTextToSize(resumeData.summary, contentWidth);
      doc.text(splitSummary, margin, yPos);
      yPos += splitSummary.length * 6 + 5;
    }
    
    // Experience Section
    if (resumeData.experience.some(exp => exp.company)) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('EXPERIENCE', margin, yPos);
      yPos += 2;
      
      // Add underline
      doc.setDrawColor(212, 165, 116); // Rust border color
      doc.setLineWidth(0.2);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 7;
      
      doc.setFont('helvetica', 'normal');
      
      resumeData.experience.forEach(exp => {
        if (exp.company) {
          // Check if we need a new page
          if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 20;
          }
          
          // Position and company
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text(`${exp.position}`, margin, yPos);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(100, 100, 100);
          doc.text(`${exp.company}, ${exp.duration}`, margin, yPos + 5);
          
          // Description
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(0, 0, 0);
          const splitDesc = doc.splitTextToSize(exp.description, contentWidth);
          doc.text(splitDesc, margin, yPos + 12);
          
          yPos += splitDesc.length * 6 + 15;
        }
      });
    }
    
    // Education Section
    if (resumeData.education.some(edu => edu.school)) {
      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('EDUCATION', margin, yPos);
      yPos += 2;
      
      // Add underline
      doc.setDrawColor(212, 165, 116); // Rust border color
      doc.setLineWidth(0.2);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 7;
      
      doc.setFont('helvetica', 'normal');
      
      resumeData.education.forEach(edu => {
        if (edu.school) {
          // Check if we need a new page
          if (yPos > pageHeight - 40) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.setFont('helvetica', 'bold');
          doc.setFontSize(12);
          doc.text(`${edu.degree} in ${edu.field}`, margin, yPos);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(11);
          doc.setTextColor(100, 100, 100);
          doc.text(`${edu.school}, ${edu.year}`, margin, yPos + 5);
          
          yPos += 15;
        }
      });
    }
    
    // Skills Section
    if (resumeData.skills) {
      // Check if we need a new page
      if (yPos > pageHeight - 60) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('SKILLS', margin, yPos);
      yPos += 2;
      
      // Add underline
      doc.setDrawColor(212, 165, 116); // Rust border color
      doc.setLineWidth(0.2);
      doc.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);
      const splitSkills = doc.splitTextToSize(resumeData.skills, contentWidth);
      doc.text(splitSkills, margin, yPos);
      yPos += splitSkills.length * 6 + 5;
    }
    
    // Add footer with page number
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, pageHeight - 10);
    }
    
    const pdfBlob = doc.output("blob");
    const formData = new FormData();
    formData.append("file", pdfBlob, `${resumeData.fullName.replace(/\s+/g, '_')}_Resume.pdf`);

    try {
      const res = await fetch("http://localhost:8002/api/resume/upload", {
        method: "POST",
        body: formData
      });

      const data = await res.json();
      if (res.ok) {
        alert("Resume saved to server successfully!");
        console.log(data);
      } else {
        alert(`Error saving resume: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error("Error uploading resume:", error);
      alert("Failed to save resume to server. Please try again.");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <div className="bg-[var(--xai-bg-secondary)]/90 backdrop-blur-md p-6 rounded-2xl border border-[var(--xai-border)] transition-all duration-300">
        <h2 className="text-3xl font-bold text-[var(--xai-text-primary)] mb-6 text-center">Resume Generator</h2>
          
        {!showPreview ? (
          <form className="space-y-6">
            {/* CONTACT INFO */}
            <div className="space-y-4 bg-[var(--xai-bg-tertiary)]/50 p-4 rounded-xl border border-[var(--xai-border)]">
              <h3 className="text-xl font-semibold text-[var(--xai-text-primary)] pb-2 border-b border-[var(--xai-border)]">Contact Information</h3>
                
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  name="fullName" 
                  value={resumeData.fullName} 
                  onChange={handleInputChange} 
                  placeholder="Full Name" 
                  className="w-full p-3 border border-[var(--xai-border)] rounded-lg bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] placeholder:text-[var(--xai-text-secondary)] focus:outline-none focus:border-[var(--xai-text-primary)] transition-all"
                />
                <input 
                  name="email" 
                  value={resumeData.email} 
                  onChange={handleInputChange} 
                  placeholder="Email Address" 
                  className="w-full p-3 border border-[var(--xai-border)] rounded-lg bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] placeholder:text-[var(--xai-text-secondary)] focus:outline-none focus:border-[var(--xai-text-primary)] transition-all"
                />
                <input 
                  name="phone" 
                  value={resumeData.phone} 
                  onChange={handleInputChange} 
                  placeholder="Phone Number" 
                  className="w-full p-3 border border-[var(--xai-border)] rounded-lg bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] placeholder:text-[var(--xai-text-secondary)] focus:outline-none focus:border-[var(--xai-text-primary)] transition-all"
                />
                <input 
                  name="location" 
                  value={resumeData.location} 
                  onChange={handleInputChange} 
                  placeholder="Location" 
                  className="w-full p-3 border border-[var(--xai-border)] rounded-lg bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] placeholder:text-[var(--xai-text-secondary)] focus:outline-none focus:border-[var(--xai-text-primary)] transition-all"
                />
              </div>
            </div>

            {/* PROFESSIONAL SUMMARY */}
            <div className="space-y-2 bg-[var(--xai-bg-tertiary)]/50 p-4 rounded-xl border border-[var(--xai-border)]">
              <h3 className="text-lg font-semibold text-[var(--xai-text-primary)] pb-2 border-b border-[var(--xai-border)]">Professional Summary</h3>
              <textarea 
                name="summary" 
                value={resumeData.summary} 
                onChange={handleInputChange} 
                placeholder="Brief professional summary highlighting your key skills and experience" 
                className="w-full p-3 border border-[var(--xai-border)] rounded-lg bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] placeholder:text-[var(--xai-text-secondary)] focus:outline-none focus:border-[var(--xai-text-primary)] transition-all min-h-[100px]"
              />
            </div>

            {/* WORK EXPERIENCE */}
            <div className="space-y-4 bg-[var(--xai-bg-tertiary)]/50 p-4 rounded-xl border border-[var(--xai-border)]">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--xai-border)]">
                <h3 className="text-lg font-semibold text-[var(--xai-text-primary)]">Work Experience</h3>
              </div>

              {resumeData.experience.map((exp, index) => (
                <div key={index} className="p-4 bg-[var(--xai-bg-secondary)] rounded-lg space-y-3 border border-[var(--xai-border)] transition-all">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      placeholder="Company" 
                      value={exp.company} 
                      onChange={(e) => handleExperienceChange(index, 'company', e.target.value)} 
                      className="w-full p-3 border border-[var(--xai-border)] rounded-lg bg-[var(--xai-bg-secondary)] text-[var(--xai-text-primary)] placeholder:text-[var(--xai-text-secondary)] focus:outline-none focus:border-[var(--xai-text-primary)] transition-all"
                    />
                    <input 
                      placeholder="Position" 
                      value={exp.position} 
                      onChange={(e) => handleExperienceChange(index, 'position', e.target.value)} 
                      className="w-full p-3 border border-[var(--xai-border)] rounded-lg bg-[var(--xai-bg-secondary)] text-[var(--xai-text-primary)] placeholder:text-[var(--xai-text-secondary)] focus:outline-none focus:border-[var(--xai-text-primary)] transition-all"
                    />
                    <input 
                      placeholder="Duration (e.g., Jan 2020 - Present)" 
                      value={exp.duration} 
                      onChange={(e) => handleExperienceChange(index, 'duration', e.target.value)} 
                      className="w-full p-3 border border-[var(--xai-border)] rounded-lg bg-[var(--xai-bg-secondary)] text-[var(--xai-text-primary)] placeholder:text-[var(--xai-text-secondary)] focus:outline-none focus:border-[var(--xai-text-primary)] transition-all"
                    />
                  </div>
                  <textarea 
                    placeholder="Description of responsibilities and achievements" 
                    value={exp.description} 
                    onChange={(e) => handleExperienceChange(index, 'description', e.target.value)} 
                    className="w-full p-3 border border-[var(--xai-border)] rounded-lg bg-[var(--xai-bg-secondary)] text-[var(--xai-text-primary)] placeholder:text-[var(--xai-text-secondary)] focus:outline-none focus:border-[var(--xai-text-primary)] transition-all min-h-[80px]"
                  />
                  <div className="flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => removeExperience(index)} 
                      className="px-3 py-1 text-red-500 hover:text-red-700 text-sm font-medium transition-colors border border-red-500 rounded hover:bg-red-500/10"
                    >
                      Remove Experience
                    </button>
                  </div>
                </div>
              ))}

              <button 
                type="button" 
                onClick={addExperience} 
                className="px-4 py-2 bg-[var(--xai-primary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-lg hover:bg-[var(--xai-bg-tertiary)] transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Experience
              </button>
            </div>

            {/* EDUCATION */}
            <div className="space-y-4 bg-[var(--xai-bg-tertiary)]/50 p-4 rounded-xl border border-[var(--xai-border)]">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--xai-border)]">
                <h3 className="text-lg font-semibold text-[var(--xai-text-primary)]">Education</h3>
              </div>

              {resumeData.education.map((edu, index) => (
                <div key={index} className="p-4 bg-[var(--xai-bg-secondary)] rounded-lg space-y-3 border border-[var(--xai-border)] transition-all">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input 
                      placeholder="School" 
                      value={edu.school} 
                      onChange={(e) => handleEducationChange(index, 'school', e.target.value)} 
                      className="w-full p-3 border border-[var(--xai-border)] rounded-lg bg-[var(--xai-bg-secondary)] text-[var(--xai-text-primary)] placeholder:text-[var(--xai-text-secondary)] focus:outline-none focus:border-[var(--xai-text-primary)] transition-all"
                    />
                    <input 
                      placeholder="Degree" 
                      value={edu.degree} 
                      onChange={(e) => handleEducationChange(index, 'degree', e.target.value)} 
                      className="w-full p-3 border border-[var(--xai-border)] rounded-lg bg-[var(--xai-bg-secondary)] text-[var(--xai-text-primary)] placeholder:text-[var(--xai-text-secondary)] focus:outline-none focus:border-[var(--xai-text-primary)] transition-all"
                    />
                    <input 
                      placeholder="Field" 
                      value={edu.field} 
                      onChange={(e) => handleEducationChange(index, 'field', e.target.value)} 
                      className="w-full p-3 border border-[var(--xai-border)] rounded-lg bg-[var(--xai-bg-secondary)] text-[var(--xai-text-primary)] placeholder:text-[var(--xai-text-secondary)] focus:outline-none focus:border-[var(--xai-text-primary)] transition-all"
                    />
                    <input 
                      placeholder="Year" 
                      value={edu.year} 
                      onChange={(e) => handleEducationChange(index, 'year', e.target.value)} 
                      className="w-full p-3 border border-[var(--xai-border)] rounded-lg bg-[var(--xai-bg-secondary)] text-[var(--xai-text-primary)] placeholder:text-[var(--xai-text-secondary)] focus:outline-none focus:border-[var(--xai-text-primary)] transition-all"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => removeEducation(index)} 
                      className="px-3 py-1 text-red-500 hover:text-red-700 text-sm font-medium transition-colors border border-red-500 rounded hover:bg-red-500/10"
                    >
                      Remove Education
                    </button>
                  </div>
                </div>
              ))}

              <button 
                type="button" 
                onClick={addEducation} 
                className="px-4 py-2 bg-[var(--xai-primary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-lg hover:bg-[var(--xai-bg-tertiary)] transition-colors text-sm font-medium flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Add Education
              </button>
            </div>

            {/* SKILLS */}
            <div className="space-y-4 bg-[var(--xai-bg-tertiary)]/50 p-4 rounded-xl border border-[var(--xai-border)]">
              <div className="flex justify-between items-center pb-2 border-b border-[var(--xai-border)]">
                <h3 className="text-lg font-semibold text-[var(--xai-text-primary)]">Skills</h3>
              </div>
              <textarea 
                placeholder="List your skills separated by commas (e.g., JavaScript, React, Node.js)" 
                value={resumeData.skills} 
                onChange={(e) => setResumeData(prev => ({ ...prev, skills: e.target.value }))} 
                className="w-full p-3 border border-[var(--xai-border)] rounded-lg bg-[var(--xai-bg-secondary)] text-[var(--xai-text-primary)] placeholder:text-[var(--xai-text-secondary)] focus:outline-none focus:border-[var(--xai-text-primary)] transition-all min-h-[100px]"
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-end gap-3 pt-4">
              <button 
                type="button" 
                onClick={() => setShowPreview(true)} 
                className="px-6 py-3 bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-lg hover:bg-[var(--xai-bg-secondary)] transition-colors font-medium"
              >
                Preview Resume
              </button>
              <button 
                type="button" 
                onClick={handleGenerateResume} 
                className="px-6 py-3 bg-[var(--xai-primary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-lg hover:bg-[var(--xai-bg-tertiary)] transition-colors font-medium"
              >
                Generate Resume
              </button>
            </div>
          </form>
        ) : null}

        {/* PREVIEW MODAL */}
        {showPreview && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-[var(--xai-bg-secondary)] rounded-2xl border border-[var(--xai-border)] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-[var(--xai-bg-secondary)] p-4 border-b border-[var(--xai-border)] flex justify-between items-center rounded-t-2xl">
                <h2 className="text-xl font-bold text-[var(--xai-text-primary)]">Resume Preview</h2>
                <div className="flex gap-2">
                  <button 
                    onClick={downloadResume} 
                    className="px-4 py-2 bg-[var(--xai-primary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-lg hover:bg-[var(--xai-bg-tertiary)] transition-colors text-sm font-medium flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download PDF
                  </button>
                  <button 
                    onClick={() => setShowPreview(false)} 
                    className="px-4 py-2 bg-[var(--xai-bg-tertiary)] text-[var(--xai-text-primary)] border border-[var(--xai-border)] rounded-lg hover:bg-[var(--xai-bg-secondary)] transition-colors text-sm font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
              <div className="p-8">
                <div className="max-w-3xl mx-auto bg-white text-black p-8 rounded-lg">
                  <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold">{resumeData.fullName}</h1>
                    <div className="flex flex-wrap justify-center gap-4 mt-2 text-sm">
                      {resumeData.email && <span>{resumeData.email}</span>}
                      {resumeData.phone && <span>{resumeData.phone}</span>}
                      {resumeData.location && <span>{resumeData.location}</span>}
                    </div>
                  </div>

                  {resumeData.summary && (
                    <div className="mb-6">
                      <h2 className="text-xl font-bold border-b-2 border-gray-800 pb-1 mb-3">SUMMARY</h2>
                      <p className="text-gray-700">{resumeData.summary}</p>
                    </div>
                  )}

                  {resumeData.experience.some(exp => exp.company) && (
                    <div className="mb-6">
                      <h2 className="text-xl font-bold border-b-2 border-gray-800 pb-1 mb-3">EXPERIENCE</h2>
                      {resumeData.experience.map((exp, index) => exp.company && (
                        <div key={index} className="mb-4">
                          <div className="flex justify-between">
                            <h3 className="font-bold">{exp.position}</h3>
                            <span className="text-gray-600">{exp.duration}</span>
                          </div>
                          <p className="font-medium">{exp.company}</p>
                          <p className="text-gray-700 mt-1">{exp.description}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {resumeData.education.some(edu => edu.school) && (
                    <div className="mb-6">
                      <h2 className="text-xl font-bold border-b-2 border-gray-800 pb-1 mb-3">EDUCATION</h2>
                      {resumeData.education.map((edu, index) => edu.school && (
                        <div key={index} className="mb-2">
                          <div className="flex justify-between">
                            <h3 className="font-bold">{edu.degree} in {edu.field}</h3>
                            <span className="text-gray-600">{edu.year}</span>
                          </div>
                          <p className="font-medium">{edu.school}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {resumeData.skills && (
                    <div>
                      <h2 className="text-xl font-bold border-b-2 border-gray-800 pb-1 mb-3">SKILLS</h2>
                      <p className="text-gray-700">{resumeData.skills}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeGenerator;
