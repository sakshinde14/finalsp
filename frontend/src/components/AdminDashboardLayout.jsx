// frontend/src/components/AdminDashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavigation from './TopNavigation';
import CourseList from './CourseList';
import WelcomeMessage from './WelcomeMessage';
import YearList from './YearList';
import SemesterList from './SemesterList';
import SubjectList from './SubjectList'; // This will be updated to pass subject context
import SearchResultsList from './SearchResultsList';

// NEW IMPORTS FOR MATERIAL MANAGEMENT
import AddMaterial from './AddMaterial';
import MaterialDisplayList from './MaterialDisplayList';

import './DashboardStyles.css';

function AdminDashboardLayout() {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null); // NEW: State for selected subject
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);

    const [adminLogoutMessage, setAdminLogoutMessage] = useState('');

    // NEW STATES FOR MATERIAL MANAGEMENT VIEW
    const [showAddMaterialForm, setShowAddMaterialForm] = useState(false);
    const [currentMaterials, setCurrentMaterials] = useState([]); // Stores materials fetched for a subject
    const [materialsLoading, setMaterialsLoading] = useState(false);
    const [materialsError, setMaterialsError] = useState(null);
    const [materialRefreshKey, setMaterialRefreshKey] = useState(0);

    // NEW: Context for AddMaterial and MaterialDisplayList
    const selectedContext = selectedCourse && selectedYear && selectedSemester && selectedSubject
        ? {
              courseCode: selectedCourse.code,
              courseName: selectedCourse.title, // Pass courseName for display
              year: selectedYear,
              semester: selectedSemester,
              subject: selectedSubject
          }
        : null;

    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (searchTerm.trim().length > 0) {
                setSearchLoading(true);
                setSearchError(null);
                setShowSearchResults(true);

                // Reset selections when searching
                setSelectedCourse(null);
                setSelectedYear(null);
                setSelectedSemester(null);
                setSelectedSubject(null); // NEW: Reset selected subject
                setShowAddMaterialForm(false); // NEW: Hide add material form
                setCurrentMaterials([]); // NEW: Clear materials

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
        setSelectedSubject(null); // NEW: Reset subject
        setShowSearchResults(false);
        setSearchTerm('');
        setSearchResults([]);
        setShowAddMaterialForm(false); // NEW: Hide add material form
        setCurrentMaterials([]); // NEW: Clear materials
    };

    const handleYearSelect = (year) => {
        setSelectedYear(year);
        setSelectedSemester(null);
        setSelectedSubject(null); // NEW: Reset subject
        setShowSearchResults(false);
        setSearchTerm('');
        setSearchResults([]);
        setShowAddMaterialForm(false); // NEW: Hide add material form
        setCurrentMaterials([]); // NEW: Clear materials
    };

    const handleSemesterSelect = (semester) => {
        setSelectedSemester(semester);
        setSelectedSubject(null); // NEW: Reset subject
        setShowSearchResults(false);
        setSearchTerm('');
        setSearchResults([]);
        setShowAddMaterialForm(false); // NEW: Hide add material form
        setCurrentMaterials([]); // NEW: Clear materials
    };

    // NEW: Handler for when a subject is clicked from SubjectList or SearchResults
    const handleSubjectSelect = (subjectName) => {
        setSelectedSubject(subjectName);
        setShowSearchResults(false); // Hide search results if navigating from there
        setSearchTerm(''); // Clear search term
        setSearchResults([]); // Clear search results
        setShowAddMaterialForm(false); // Ensure add material form is hidden
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
        setSelectedSubject(null); // NEW: Reset subject
        setShowSearchResults(false);
        setSearchTerm('');
        setSearchResults([]);
        setShowAddMaterialForm(false); // NEW: Hide add material form
        setCurrentMaterials([]); // NEW: Clear materials
    };

    const handleAdminLogout = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/logout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });

            if (response.ok) {
                console.log("Admin successfully logged out");
                setAdminLogoutMessage("Admin Successfully Logged Out!");
                localStorage.removeItem('userRole'); // Clear user role
                sessionStorage.clear(); // Clear session storage for robustness
                resetSelection();
                setTimeout(() => {
                    setAdminLogoutMessage('');
                    navigate('/login/admin');
                }, 2000);
            } else {
                const errorData = await response.json();
                console.error("Admin Logout failed:", errorData);
                setAdminLogoutMessage("Logout Failed: errorData.message || 'Unknown error'}");
                setTimeout(() => {
                    setAdminLogoutMessage('');
                }, 3000);
            }
        } catch (error) {
            console.error("Error during admin logout:", error);
            setAdminLogoutMessage(`Network Error: ${error.message}`);
            setTimeout(() => {
                setAdminLogoutMessage('');
            }, 3000);
        }
    };

    // NEW: Handlers for AddMaterial form
    const handleAddMaterialClick = () => {
        if (!selectedContext || !selectedContext.subject) {
            setAdminLogoutMessage('Please select a Course, Year, Semester, and Subject first.');
            setTimeout(() => setAdminLogoutMessage(''), 3000);
            return;
        }
        setShowAddMaterialForm(true);
        setCurrentMaterials([]); // Hide materials list when showing form
    };

    const handleMaterialAdded = () => {
    setShowAddMaterialForm(false); // Hide form after successful addition
    // Re-fetch materials for the current subject to update the list
    // This will be triggered by the useEffect that depends on selectedContext
    setMaterialRefreshKey(prevKey => prevKey + 1); // This is now the ONLY trigger for re-fetching
    // Forcing a re-fetch means we don't need to manually update currentMaterials here
};

    const handleCancelAddMaterial = () => {
        setShowAddMaterialForm(false);
        // If materials were previously displayed, they should reappear
        // This will be handled by useEffect when selectedSubject is still set.
    };

    return (
        <div className="dashboard-container">
            <TopNavigation onLogout={handleAdminLogout} />
            <main className="main-content">
                {adminLogoutMessage && (
                    <div className={`logout-popup ${adminLogoutMessage.includes('Failed') || adminLogoutMessage.includes('Error') ? 'error' : 'success'}`}>
                        {adminLogoutMessage}
                    </div>
                )}

                {/* Welcome message and Search Bar */}
                {!showSearchResults && !selectedContext && !showAddMaterialForm && (
                    <WelcomeMessage message="Welcome, Admin! Manage Study Materials." />
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
                ) : showAddMaterialForm ? (
                    <AddMaterial
                        onMaterialAdded={handleMaterialAdded}
                        onCancelAdd={handleCancelAddMaterial}
                        selectedContext={selectedContext}
                    />
                ) : selectedContext && selectedContext.subject ? (
                    // Display materials for the selected subject
                    <div className="subject-materials-view">
                        <h3 className="subject-title-header">Materials for: {selectedContext.subject} ({selectedContext.courseCode}, Year {selectedContext.year}, Sem {selectedContext.semester})</h3>
                        {materialsLoading ? (
                            <div className="loading-message">Loading materials...</div>
                        ) : materialsError ? (
                            <div className="error-message">Error fetching materials: {materialsError}</div>
                        ) : (
                            <MaterialDisplayList materials={currentMaterials} />
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

                {/* Admin-specific management tools */}
                <div className="admin-management-section">
                    <h3>Admin Tools:</h3>
                    {selectedContext && selectedContext.subject ? (
                        <button className="form-button" onClick={handleAddMaterialClick} style={{ marginRight: '10px' }}>
                            Add New Material for {selectedContext.subject}
                        </button>
                    ) : (
                        <button className="form-button" onClick={handleAddMaterialClick} style={{ marginRight: '10px' }} disabled>
                            Select Subject to Add Material
                        </button>
                    )}
                    <button className="form-button" disabled>Manage Existing Materials (Coming Soon)</button>
                </div>
            </main>
        </div>
    );
}

export default AdminDashboardLayout;