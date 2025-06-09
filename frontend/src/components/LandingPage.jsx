
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
                    <p className="section-subtitle">Get started in three simple steps</p>
                    
                    <div className="steps-grid">
                        <div className="step-card">
                            <div className="step-icon">
                                <div className="icon-circle">1</div>
                            </div>
                            <h3>Create Your Account</h3>
                            <p>Sign up as a student and join our learning community. Quick and easy registration process.</p>
                        </div>
                        
                        <div className="step-card">
                            <div className="step-icon">
                                <div className="icon-circle">2</div>
                            </div>
                            <h3>Browse Study Materials</h3>
                            <p>Access organized course materials by year, semester, and subject. Find exactly what you need.</p>
                        </div>
                        
                        <div className="step-card">
                            <div className="step-icon">
                                <div className="icon-circle">3</div>
                            </div>
                            <h3>Manage Your Notes</h3>
                            <p>Create, organize, and access your personal study notes anytime, anywhere.</p>
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
                        <div className="footer-links">
                            <div className="footer-section">
                                <h4>Quick Links</h4>
                                <Link to="/login/student">Student Login</Link>
                                <Link to="/signup/student">Sign Up</Link>
                                <Link to="/login/admin">Admin Access</Link>
                            </div>
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
