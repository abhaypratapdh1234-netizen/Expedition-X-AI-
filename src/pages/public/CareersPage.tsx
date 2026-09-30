import React, { useState } from 'react';
import { Briefcase, Users, Zap, Code, Heart, X, Upload, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CareersPage() {
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const jobs = [
    { title: 'Senior AI Engineer', department: 'Engineering', location: 'Remote (Global)', type: 'Full-time' },
    { title: 'Product Designer', department: 'Design', location: 'Bangalore, India', type: 'Full-time' },
    { title: 'Travel Operations Lead', department: 'Operations', location: 'London, UK', type: 'Full-time' },
    { title: 'Data Scientist (NLP)', department: 'Engineering', location: 'Remote (US/EU)', type: 'Full-time' },
  ];

  return (
    <div className="min-h-screen pt-32 pb-24" style={{ background: 'var(--bg-primary)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <div className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-[16px] font-bold font-display mb-8 text-[#000000] border-2 border-[#000000]/10 shadow-sm"
            style={{ background: 'var(--bg-card)' }}>
            <Briefcase size={18} className="text-[#FC6C26]" /> We're Hiring
          </div>
          <h1 className="text-6xl md:text-7xl font-display font-bold mb-8 tracking-tight text-[#000000] leading-[1.1]">
            Build the future of travel.
          </h1>
          <p className="text-[24px] font-medium font-display max-w-3xl mx-auto text-[var(--text-primary)] leading-[1.7]">
            Join a world-class team blending cutting-edge AI with a deep passion for global exploration. Help us make travel planning effortless for millions.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
          {[
            { icon: Zap, title: 'Move Fast', desc: 'We ship quickly and iterate. No red tape, just pure execution.' },
            { icon: Users, title: 'Global Team', desc: 'Work from anywhere. We value talent, regardless of geography.' },
            { icon: Heart, title: 'Health & Wellness', desc: 'Premium healthcare, unlimited PTO, and mental health support.' }
          ].map((perk, i) => (
            <motion.div 
              key={perk.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="p-10 rounded-3xl text-center bg-[var(--bg-card)] border-2 border-transparent hover:border-[#000000]/10 transition-all shadow-sm"
            >
              <div className="w-16 h-16 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center text-[#FC6C26] mb-8">
                <perk.icon size={32} />
              </div>
              <h3 className="text-[28px] font-bold font-display mb-4 text-[#000000] tracking-tight">{perk.title}</h3>
              <p className="text-[19px] font-medium font-display leading-[1.8] text-[var(--text-primary)]">{perk.desc}</p>
            </motion.div>
          ))}
        </div>

        <h2 className="text-5xl font-display font-bold mb-14 text-center tracking-tight text-[#000000]">Open Positions</h2>
        
        <div className="space-y-6 max-w-5xl mx-auto">
          {jobs.map((job, i) => (
            <motion.div 
              key={job.title}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="group p-8 rounded-3xl flex flex-col md:flex-row items-start md:items-center justify-between cursor-pointer transition-all hover:scale-[1.01] bg-[var(--bg-card)] border-2 border-transparent hover:border-[#000000] shadow-sm"
            >
              <div>
                <h3 className="text-[26px] font-bold font-display mb-4 group-hover:text-[#FC6C26] transition-colors text-[#000000] tracking-tight">
                  {job.title}
                </h3>
                <div className="flex flex-wrap items-center gap-6 text-[17px] font-bold font-display text-[var(--text-primary)]">
                  <span className="flex items-center gap-2"><Code size={18} className="text-[#FC6C26]"/> {job.department}</span>
                  <span className="px-3 py-1 rounded-md bg-gray-100 text-[#000000]">{job.type}</span>
                </div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedJob(job.title);
                  setSubmitted(false);
                }}
                className="mt-6 md:mt-0 px-8 py-3.5 rounded-full text-[17px] font-bold font-display uppercase tracking-wider text-white bg-[#000000] group-hover:bg-[#FC6C26] transition-colors shadow-md"
              >
                Apply Now
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Premium Application Modal */}
      <AnimatePresence>
        {selectedJob && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#000000]/60 backdrop-blur-sm" onClick={() => !submitted && setSelectedJob(null)}>
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[var(--bg-card)] rounded-[32px] p-8 md:p-12 max-w-2xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {!submitted && (
                <button 
                  onClick={() => setSelectedJob(null)}
                  className="absolute top-8 right-8 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-[var(--text-primary)] hover:bg-[#FC6C26] hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              )}

              {submitted ? (
                <div className="text-center py-12">
                  <motion.div 
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }}
                    className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 text-green-600"
                  >
                    <CheckCircle2 size={48} />
                  </motion.div>
                  <h2 className="text-4xl font-bold font-display mb-4 text-[#000000] tracking-tight">Application Received!</h2>
                  <p className="text-[19px] font-medium font-display leading-[1.8] text-[var(--text-primary)] mb-10 max-w-lg mx-auto">
                    Thank you for applying for the <strong>{selectedJob}</strong> position. Our recruiting team will review your profile and get back to you within 48 hours.
                  </p>
                  <button 
                    onClick={() => setSelectedJob(null)}
                    className="px-8 py-3.5 rounded-full text-[17px] font-bold font-display uppercase tracking-wider text-white bg-[#000000] hover:bg-[#FC6C26] transition-colors shadow-md"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-12 pr-12">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-[15px] font-bold font-display mb-6 bg-[#000000] text-white uppercase tracking-widest shadow-md">
                      Application Form
                    </div>
                    <h2 className="text-5xl md:text-6xl font-bold font-display text-[#000000] tracking-tight leading-[1.1]">
                      Apply for <span className="text-[#FC6C26]">{selectedJob}</span>
                    </h2>
                  </div>

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      setSubmitted(true);
                    }}
                    className="space-y-8"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="text-[18px] font-bold font-display text-[#000000] uppercase tracking-wide">Full Name</label>
                        <input required type="text" placeholder="ANANT AMBANI" className="w-full px-6 py-5 rounded-2xl bg-[var(--bg-card)] border-4 border-[#000000]/10 focus:border-[#000000] transition-all outline-none text-[20px] font-bold font-display text-[#000000] placeholder:text-[#000000]/30 shadow-sm" />
                      </div>
                      <div className="space-y-3">
                        <label className="text-[18px] font-bold font-display text-[#000000] uppercase tracking-wide">Email Address</label>
                        <input required type="email" placeholder="ANANTAMBANI@GMAIL.COM" className="w-full px-6 py-5 rounded-2xl bg-[var(--bg-card)] border-4 border-[#000000]/10 focus:border-[#000000] transition-all outline-none text-[20px] font-bold font-display text-[#000000] placeholder:text-[#000000]/30 shadow-sm" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="text-[18px] font-bold font-display text-[#000000] uppercase tracking-wide">Portfolio / LinkedIn URL</label>
                      <input required type="url" placeholder="HTTPS://LINKEDIN.COM/IN/..." className="w-full px-6 py-5 rounded-2xl bg-[var(--bg-card)] border-4 border-[#000000]/10 focus:border-[#000000] transition-all outline-none text-[20px] font-bold font-display text-[#000000] placeholder:text-[#000000]/30 shadow-sm" />
                    </div>

                    <div className="space-y-3">
                      <label className="text-[18px] font-bold font-display text-[#000000] uppercase tracking-wide">Resume Upload</label>
                      <label className="w-full flex flex-col items-center justify-center px-6 py-12 border-4 border-dashed border-[#000000]/20 rounded-3xl cursor-pointer hover:border-[#FC6C26] hover:bg-[#FC6C26]/5 transition-all group bg-[var(--bg-card)] shadow-sm">
                        <Upload size={36} className="text-[#000000] group-hover:text-[#FC6C26] mb-4 transition-colors" />
                        <span className="text-[22px] font-bold font-display text-[#000000] group-hover:text-[#FC6C26] transition-colors">CLICK TO UPLOAD RESUME</span>
                        <span className="text-[16px] font-bold font-display text-[#000000]/50 mt-2">PDF, DOCX UP TO 5MB</span>
                        <input type="file" className="hidden" accept=".pdf,.doc,.docx" required />
                      </label>
                    </div>

                    <button 
                      type="submit"
                      className="w-full mt-10 px-8 py-5 rounded-full text-[22px] font-bold font-display uppercase tracking-widest text-white bg-[#000000] hover:bg-[#FC6C26] transition-colors shadow-xl"
                    >
                      Submit Application
                    </button>
                  </form>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
