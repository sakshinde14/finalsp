// DashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavigation from './TopNavigation';
import CourseList from './CourseList';
import WelcomeMessage from './WelcomeMessage';
import YearList from './YearList';
import SemesterList from './SemesterList';
import SubjectList from './SubjectList';
import SearchResultsList from './SearchResultsList';
import MaterialDisplayList from './MaterialDisplayList';

import './DashboardStyles.css'; // Ensure this contains your new message styles

function DashboardLayout() {
    const navigate = useNavigate();

    // Existing states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null); // NEW: State for selected subject
    const [currentMaterials, setCurrentMaterials] = useState([]); // Stores materials fetched for a subject
    const [materialsLoading, setMaterialsLoading] = useState(false);
    const [materialsError, setMaterialsError] = useState(null);
    const [materialRefreshKey, setMaterialRefreshKey] = useState(0);
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);
    const [selectedMaterialType, setSelectedMaterialType] = useState('all'); // 'all', 'notes', 'papers', 'syllabus'


    // NEW: Context for MaterialDisplayList
    const selectedContext = selectedCourse && selectedYear && selectedSemester && selectedSubject
        ? {
              courseCode: selectedCourse.code,
              courseName: selectedCourse.title, // Pass courseName for display
              year: selectedYear,
              semester: selectedSemester,
              subject: selectedSubject
          }
        : null;

    // --- NEW STATE for logout message ---
    const [logoutMessage, setLogoutMessage] = useState('');

    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (searchTerm.trim().length > 0) {
                setSearchLoading(true);
                setSearchError(null);
                setShowSearchResults(true);

                setSelectedCourse(null);
                setSelectedYear(null);
                setSelectedSemester(null);
                setSelectedSubject(null);

                try {
                    const response = await fetch(`http://localhost:5000/api/search/subjects?q=${encodeURIComponent(searchTerm.trim())}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const data = await response.json();
                    setSearchResults(data);
                } catch (e) {
                    console.error("Error fetching search results:", e);
                    setSearchError(e.message);
                } finally {
                    setSearchLoading(false);
                }
            } else if (searchTerm.trim().length === 0) {
                setShowSearchResults(false);
                setSearchResults([]);
                setSearchError(null);
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    // NEW: Effect to fetch materials when a subject context is fully selected
        useEffect(() => {
        const fetchMaterials = async () => {
            console.log("FETCH MATERIALS useEffect triggered for:", selectedContext);
            console.log("Current materialRefreshKey:", materialRefreshKey);
    
            if (selectedContext && selectedContext.subject) {
                setMaterialsLoading(true);
                setMaterialsError(null);
                try {
                    const encodedSubject = encodeURIComponent(selectedContext.subject);
                    console.log("DEBUG: selectedContext.subject =", selectedContext.subject);
                    console.log("DEBUG: encodedSubject =", encodedSubject);
                    console.log("DEBUG: Full URL to fetch =", `http://localhost:5000/api/materials/${selectedContext.courseCode}/${selectedContext.year}/${selectedContext.semester}/${encodedSubject}`);
                    const response = await fetch(`http://localhost:5000/api/materials/${selectedContext.courseCode}/${selectedContext.year}/${selectedContext.semester}/${encodedSubject}`);
    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
    
                    const data = await response.json();
                    setCurrentMaterials(data);
                } catch (e) {
                    console.error("Error fetching materials:", e);
                    //setMaterialsError('Error fetching materials: {e.message}');
                } finally {
                    setMaterialsLoading(false);
                }
            } else {
                setCurrentMaterials([]);
            }
        };
    
        fetchMaterials();
    }, [
        selectedContext?.courseCode,
        selectedContext?.year,
        selectedContext?.semester,
        selectedContext?.subject,
        materialRefreshKey
    ]);



    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleCourseSelect = (course) => {
        setSelectedCourse(course);
        setSelectedYear(null);
        setSelectedSemester(null);
        setSelectedSubject(null);
        setShowSearchResults(false);
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleYearSelect = (year) => {
        setSelectedYear(year);
        setSelectedSemester(null);
        setShowSearchResults(false);
        setSelectedSubject(null);
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleSemesterSelect = (semester) => {
        setSelectedSemester(semester);
        setShowSearchResults(false);
        setSelectedSubject(null);
        setSearchTerm('');
        setSearchResults([]);
    };

    // NEW: Handler for when a subject is clicked from SubjectList or SearchResults
    const handleSubjectSelect = (subjectName) => {
        setSelectedSubject(subjectName);
        setShowSearchResults(false); // Hide search results if navigating from there
        setSearchTerm(''); // Clear search term
        setSearchResults([]); // Clear search results
        // Materials will be fetched by useEffect based on selectedContext
    };


    const handleSearchResultClick = (subjectDetails) => {
        setSelectedCourse({ code: subjectDetails.courseCode, title: subjectDetails.courseName });
        setSelectedYear(subjectDetails.year);
        setSelectedSemester(subjectDetails.semester);
        handleSubjectSelect(subjectDetails.subjectName); // Use the new handler
    };

    const resetSelection = () => {
        setSelectedCourse(null);
        setSelectedYear(null);
        setSelectedSemester(null);
        setSelectedSubject(null);
        setShowSearchResults(false);
        setSearchTerm('');
        setSearchResults([]);
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (response.ok) {
                console.log("Successfully logged out");
                setLogoutMessage("Successfully Logged Out!"); // Set success message
                resetSelection(); // Clear dashboard selections
                
                // Delay redirection to show the message
                setTimeout(() => {
                    setLogoutMessage(''); // Clear message after it has been seen
                    navigate('/login/student'); // Redirect
                }, 2000); // Display message for 2 seconds (2000 milliseconds)
            } else {
                const errorData = await response.json();
                console.error("Logout failed:", errorData);
                setLogoutMessage(`Logout Failed: ${errorData.message || 'Unknown error'}`); // Set error message
                setTimeout(() => {
                    setLogoutMessage(''); // Clear message after a delay even on error
                }, 3000); // Show error message a bit longer
            }
        } catch (error) {
            console.error("Error during logout:", error);
            setLogoutMessage(`Network Error: ${error.message}`); // Set network error message
            setTimeout(() => {
                setLogoutMessage('');
            }, 3000);
        }
    };

    return (
        <div className="dashboard-container">
            <TopNavigation onLogout={handleLogout} />
            <main className="main-content">
                {/* --- NEW: Display logout message --- */}
                {logoutMessage && (
                    <div className={`logout-popup ${logoutMessage.includes('Failed') || logoutMessage.includes('Error') ? 'error' : 'success'}`}>
                        {logoutMessage}
                    </div>
                )}
                {/* --- End NEW --- */}

                {/* Welcome message for the Admin Dashboard */}
                {!showSearchResults && !selectedCourse && (
                    <WelcomeMessage message="Welcome, Student." /> /* Correctly passing the message prop */
                )}
                
                
                <div className="search-bar-container">
                    <input
                        type="text"
                        placeholder="Search for subjects or study materials..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                </div>

                {/* Conditional Rendering based on state */}
                {showSearchResults ? (
                    searchLoading ? (
                        <div className="loading-message">Searching...</div>
                    ) : searchError ? (
                        <div className="error-message">Error during search: {searchError}</div>
                    ) : (
                        <SearchResultsList
                            results={searchResults}
                            onResultClick={handleSearchResultClick}
                        />
                    )
                ): selectedContext && selectedContext.subject ? (
                    // Display materials for the selected subject
                    <div className="subject-materials-view">
                        <h3 className="subject-title-header">Materials for: {selectedContext.subject} ({selectedContext.courseCode}, Year {selectedContext.year}, Sem {selectedContext.semester})</h3>
                        {materialsLoading ? (
                            <div className="loading-message">Loading materials...</div>
                        ) : materialsError ? (
                            <div className="error-message">Error fetching materials: {materialsError}</div>
                        ) : (
                            <MaterialDisplayList
                                materials={currentMaterials}
                                selectedType={selectedMaterialType}
                                onTypeChange={setSelectedMaterialType}
                            />

                        )}
                        <button onClick={resetSelection} className="back-button">Back to Courses</button>
                    </div>
                ) : (
                    // Default navigation flow (Courses -> Years -> Semesters -> Subjects)
                    !selectedCourse ? (
                        <CourseList onCourseSelect={handleCourseSelect} />
                    ) : !selectedYear ? (
                        <YearList courseCode={selectedCourse.code} onYearSelect={handleYearSelect} />
                    ) : !selectedSemester ? (
                        <SemesterList
                            onSemesterSelect={handleSemesterSelect}
                            courseCode={selectedCourse.code}
                            selectedYear={selectedYear}
                        />
                    ) : (
                        <SubjectList
                            courseCode={selectedCourse.code}
                            year={selectedYear}
                            semester={selectedSemester}
                            onSubjectSelect={handleSubjectSelect} // NEW: Pass handler
                            onReset={resetSelection}
                        />
                    )
                )}
            </main>
        </div>
    );
}

export default DashboardLayout;