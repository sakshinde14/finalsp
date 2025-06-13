
import React from 'react';
import { Link } from 'react-router-dom';
import './LandingPageStyles.css';

function LandingPage() {
    return (
        <div className="landing-page">
            {/* Navigation Header */}
            <nav className="landing-nav">
                <div className="nav-container">
                    <div className="nav-brand">
                        <h2>StudyPortal</h2>
                        <span className="brand-tagline">Learn. Grow. Excel.</span>
                    </div>
                    <div className="nav-links">
                        <Link to="/login/student" className="nav-link">Student Login</Link>
                        <Link to="/login/admin" className="nav-link">Admin Login</Link>
                        <Link to="/signup/student" className="nav-link nav-cta">Get Started</Link>
                    </div>
                </div>
            </nav>


            {/* How It Works Section */}
            <section className="how-it-works">
    <div className="container">
        <h2 className="section-title">How It Works</h2>
        <h3 className="section-n">For Students</h3>
        <p className="section-subtitle">Get started in three simple steps</p>
        
        <div className="steps-grid">
            <div className="step-card">
                <div className="step-icon">
                    <div className="icon-circle">1</div>
                </div>
                <h3>Create Your Account</h3>
                <p>Sign up as a student and get instant access to a library of organized study materials.</p>
            </div>
            
            <div className="step-card">
                <div className="step-icon">
                    <div className="icon-circle">2</div>
                </div>
                <h3>Find Your Subject</h3>
                <p>Search directly or navigate by course, year, and semester to locate your subjects easily.</p>
            </div>
            
            <div className="step-card">
                <div className="step-icon">
                    <div className="icon-circle">3</div>
                </div>
                <h3>View Study Materials</h3>
                <p>Access helpful notes, question papers, and syllabus content uploaded by admins.</p>
            </div>
        </div>
    </div>

    <div className="container">
        <h3 className="section-n">For Admins</h3>
        <p className="section-subtitle">Manage and update the study material database</p>

        <div className="steps-grid">
            <div className="step-card">
                <div className="step-icon">
                    <div className="icon-circle">1</div>
                </div>
                <h3>Admin Login</h3>
                <p>Securely sign in to access the admin dashboard and manage educational resources.</p>
            </div>

            <div className="step-card">
                <div className="step-icon">
                    <div className="icon-circle">2</div>
                </div>
                <h3>Upload Materials</h3>
                <p>Add study notes, question papers, and syllabus documents for specific subjects.</p>
            </div>

            <div className="step-card">
                <div className="step-icon">
                    <div className="icon-circle">3</div>
                </div>
                <h3>Organize Content</h3>
                <p>Assign materials by course, year, semester, and subject to keep everything structured.</p>
            </div>
        </div>
    </div>
</section>




            {/* Footer */}
            <footer className="landing-footer">
                <div className="container">
                    <div className="footer-content">
                        <div className="footer-brand">
                            <h3>StudyPortal</h3>
                            <p>Empowering students with accessible, organized learning resources.</p>
                        </div>
                        <div className="footer-brand">
                            <h3>Contact</h3>
                            <p>&#9993; : support@studyportal.com</p>
                            <p>&#9742; : +91 9876543210</p>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2024 StudyPortal. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;