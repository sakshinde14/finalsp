// frontend/src/components/AdminDashboardLayout.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TopNavigation from './TopNavigation';
import CourseList from './CourseList';
import WelcomeMessage from './WelcomeMessage';
import YearList from './YearList';
import SemesterList from './SemesterList';
import SubjectList from './SubjectList';
import SearchResultsList from './SearchResultsList';

// IMPORTS FOR MATERIAL MANAGEMENT
import AddMaterial from './AddMaterial';
import MaterialDisplayList from './MaterialDisplayList'; // For student/Browse view
import ManageMaterials from './ManageMaterials';       // For admin management view

//import './DashboardStyles.css';
import './AdminDashboardStyles.css'; // Assuming you have this for admin-specific styling

function AdminDashboardLayout() {
    const navigate = useNavigate();

    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedYear, setSelectedYear] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [searchResults, setSearchResults] = useState([]);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState(null);

    const [logoutMessage, setLogoutMessage] = useState(''); // Unified message state

    // States to control which admin panel is visible
    const [showAddMaterialForm, setShowAddMaterialForm] = useState(false);
    const [showManageMaterialsPanel, setShowManageMaterialsPanel] = useState(false);

    // States for displaying materials (for the general Browse/student view, not admin management)
    const [currentMaterials, setCurrentMaterials] = useState([]);
    const [materialsLoading, setMaterialsLoading] = useState(false);
    const [materialsError, setMaterialsError] = useState(null);
    const [materialRefreshKey, setMaterialRefreshKey] = useState(0); // To force re-fetching materials

    // This context object is crucial for passing selected navigation state to other components
    const selectedContext = selectedCourse && selectedYear && selectedSemester && selectedSubject
        ? {
              courseCode: selectedCourse.code,
              courseName: selectedCourse.title,
              year: selectedYear,
              semester: selectedSemester,
              subject: selectedSubject
          }
        : null;

    // Effect for Subject Search
    useEffect(() => {
        const delaySearch = setTimeout(async () => {
            if (searchTerm.trim().length > 0) {
                setSearchLoading(true);
                setSearchError(null);
                setShowSearchResults(true);
                // When searching, clear current selections and hide admin panels
                // We keep selectedContext intact here as search might lead to a new context
                setSelectedCourse(null); // Clear navigation selection to prioritize search results
                setSelectedYear(null);
                setSelectedSemester(null);
                setSelectedSubject(null);
                setShowAddMaterialForm(false);
                setShowManageMaterialsPanel(false);
                setCurrentMaterials([]);

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
                // Do NOT reset navigation if search term becomes empty, let previous selection persist
            }
        }, 500);

        return () => clearTimeout(delaySearch);
    }, [searchTerm]);

    // Effect to fetch materials for the Browse/student view
    useEffect(() => {
        const fetchMaterialsForBrowse = async () => {
            // Only fetch materials for Browse if a subject is selected AND no admin panel is active
            if (selectedContext && selectedContext.subject && !showAddMaterialForm && !showManageMaterialsPanel) {
                setMaterialsLoading(true);
                setMaterialsError(null);
                try {
                    const encodedSubject = encodeURIComponent(selectedContext.subject);
                    const response = await fetch(`http://localhost:5000/api/materials/${selectedContext.courseCode}/${selectedContext.year}/${selectedContext.semester}/${encodedSubject}`);

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }

                    const data = await response.json();
                    setCurrentMaterials(data);
                } catch (e) {
                    console.error("Error fetching materials for display:", e);
                    setMaterialsError(`Error fetching materials: ${e.message}`);
                } finally {
                    setMaterialsLoading(false);
                }
            } else {
                setCurrentMaterials([]); // Clear materials if context is incomplete or admin form is active
            }
        };

        fetchMaterialsForBrowse();
    }, [
        selectedContext?.courseCode,
        selectedContext?.year,
        selectedContext?.semester,
        selectedContext?.subject,
        materialRefreshKey, // Trigger refresh if materials are added/managed
        showAddMaterialForm, // Re-evaluate when add form is hidden
        showManageMaterialsPanel // Re-evaluate when manage panel is hidden
    ]);

    // Helper to reset all navigation and admin form states to initial dashboard state (CourseList)
    const resetToCourseList = () => {
        setSelectedCourse(null);
        setSelectedYear(null);
        setSelectedSemester(null);
        setSelectedSubject(null);
        setShowSearchResults(false);
        setSearchTerm('');
        setSearchResults([]);
        setShowAddMaterialForm(false);
        setShowManageMaterialsPanel(false);
        setCurrentMaterials([]);
        setLogoutMessage(''); // Clear messages on full reset
    };

    // Handlers for navigation clicks
    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setShowAddMaterialForm(false); // Hide admin forms when typing in search
        setShowManageMaterialsPanel(false);
    };

    const handleCourseSelect = (course) => {
        setSelectedCourse(course);
        setSelectedYear(null);
        setSelectedSemester(null);
        setSelectedSubject(null);
        setShowSearchResults(false); // Hide search results if navigating
        setShowAddMaterialForm(false); // Hide admin forms
        setShowManageMaterialsPanel(false);
        setSearchTerm(''); // Clear search bar
        setCurrentMaterials([]);
    };

    const handleYearSelect = (year) => {
        setSelectedYear(year);
        setSelectedSemester(null);
        setSelectedSubject(null);
        setShowSearchResults(false);
        setShowAddMaterialForm(false);
        setShowManageMaterialsPanel(false);
        setCurrentMaterials([]);
    };

    const handleSemesterSelect = (semester) => {
        setSelectedSemester(semester);
        setSelectedSubject(null);
        setShowSearchResults(false);
        setShowAddMaterialForm(false);
        setShowManageMaterialsPanel(false);
        setCurrentMaterials([]);
    };

    const handleSubjectSelect = (subjectName) => {
        setSelectedSubject(subjectName);
        setShowSearchResults(false);
        setSearchTerm('');
        setSearchResults([]);
        setShowAddMaterialForm(false); // Hide admin forms initially
        setShowManageMaterialsPanel(false);
        // Materials will be fetched by useEffect based on selectedContext
    };

    const handleSearchResultClick = (subjectDetails) => {
        // Set all relevant states based on search result
        setSelectedCourse({ code: subjectDetails.courseCode, title: subjectDetails.courseName });
        setSelectedYear(subjectDetails.year);
        setSelectedSemester(subjectDetails.semester);
        setSelectedSubject(subjectDetails.subjectName); // Directly select subject
        setShowSearchResults(false); // Hide search results
        setSearchTerm(''); // Clear search term
        setSearchResults([]); // Clear search results
        setShowAddMaterialForm(false); // Hide any open admin forms
        setShowManageMaterialsPanel(false);
        // materials will be fetched by useEffect
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
                console.log("Successfully logged out");
                setLogoutMessage("Successfully Logged Out!"); // Set success message
                
                // Delay redirection to show the message
                setTimeout(() => {
                    setLogoutMessage(''); // Clear message after it has been seen
                    navigate('/login/admin'); // Redirect
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
            console.error("Error during admin logout:", error);
            setLogoutMessage(`Network Error: ${error.message}`);
            setTimeout(() => {
                setLogoutMessage('');
            }, 3000);
        }
    };

    // Handlers for admin action buttons
    const handleAddMaterialClick = () => {
        if (!selectedContext || !selectedContext.subject) {
            setLogoutMessage('Please select a Course, Year, Semester, and Subject first.');
            setTimeout(() => setLogoutMessage(''), 3000);
            return;
        }
        setShowAddMaterialForm(true);
        setShowManageMaterialsPanel(false); // Hide other admin panels
        setLogoutMessage(''); // Clear any previous messages
    };

    const handleManageMaterialsClick = () => {
        if (!selectedContext || !selectedContext.subject) {
            setLogoutMessage('Please select a Course, Year, Semester, and Subject first to manage materials.');
            setTimeout(() => setLogoutMessage(''), 3000);
            return;
        }
        setShowManageMaterialsPanel(true);
        setShowAddMaterialForm(false); // Hide other admin panels
        setLogoutMessage(''); // Clear any previous messages
    };

    // Callbacks from AddMaterial / ManageMaterials components
    const handleMaterialAdded = () => {
        setShowAddMaterialForm(false); // Hide form after successful addition
        setMaterialRefreshKey(prevKey => prevKey + 1); // Trigger re-fetch for Browse mode and ManageMaterials
        setLogoutMessage('Material added successfully!');
        setTimeout(() => setLogoutMessage(''), 3000);
    };

    const handleMaterialManaged = (message) => {
        // We keep the ManageMaterialsPanel open usually after an action
        setMaterialRefreshKey(prevKey => prevKey + 1); // Trigger re-fetch for Browse mode and ManageMaterials
        setLogoutMessage(message || 'Material managed successfully!');
        setTimeout(() => setLogoutMessage(''), 3000);
    };

    const handleCancelAddMaterial = () => {
        setShowAddMaterialForm(false);
        // materials will re-appear if selectedSubject is still set, via useEffect
    };

    const handleCancelManageMaterials = () => {
        setShowManageMaterialsPanel(false);
        // materials will re-appear if selectedSubject is still set, via useEffect
    };

    // Determine what to display based on current state
    const renderContent = () => {
        if (showSearchResults) {
            return searchLoading ? (
                <div className="loading-message">Searching...</div>
            ) : searchError ? (
                <div className="error-message">Error during search: {searchError}</div>
            ) : (
                <SearchResultsList
                    results={searchResults}
                    onResultClick={handleSearchResultClick}
                />
            );
        } else if (showAddMaterialForm) {
            return (
                <AddMaterial
                    onMaterialAdded={handleMaterialAdded}
                    onCancelAdd={handleCancelAddMaterial}
                    selectedContext={selectedContext}
                />
            );
        } else if (showManageMaterialsPanel) {
            return (
                <ManageMaterials
                    onMaterialManaged={handleMaterialManaged}
                    onCancelManage={handleCancelManageMaterials}
                    selectedContext={selectedContext} // Pass selected context for filtering
                />
            );
        } else if (selectedContext && selectedContext.subject) {
            // Display materials for the selected subject (Browse view for student/admin)
            return (
                <div className="subject-materials-view">
                    <h3 className="subject-title-header" >
                        Materials for: {selectedContext.subject} ({selectedContext.courseCode}, Year {selectedContext.year}, Sem {selectedContext.semester})
                    </h3>
                    {materialsLoading ? (
                        <div className="loading-message">Loading materials...</div>
                    ) : materialsError ? (
                        <div className="error-message">Error fetching materials: {materialsError}</div>
                    ) : (
                        <MaterialDisplayList materials={currentMaterials} />
                    )}
                    {/* BACK BUTTON for Study Material -> Subject List */}
                    <button onClick={() => setSelectedSubject(null)} className="back-button">Back to Subject Selection</button>
                </div>
            );
        } else {
            // Default navigation flow (Courses -> Years -> Semesters -> Subjects)
            return (
                <div className="navigation-section">
                    {!selectedCourse ? (
                        <CourseList onCourseSelect={handleCourseSelect} />
                    ) : !selectedYear ? (
                        <>
                            <YearList courseCode={selectedCourse.code} onYearSelect={handleYearSelect} />
                            {/* BACK BUTTON for Year List -> Course List */}
                            <button onClick={() => setSelectedCourse(null)} className="back-button">Back to Courses</button>
                        </>
                    ) : !selectedSemester ? (
                        <>
                            <SemesterList
                                onSemesterSelect={handleSemesterSelect}
                                courseCode={selectedCourse.code}
                                selectedYear={selectedYear}
                            />
                            {/* BACK BUTTON for Semester List -> Year List */}
                            <button onClick={() => setSelectedYear(null)} className="back-button">Back to Year</button>
                        </>
                    ) : ( // When course, year, semester are selected, show subjects
                        <>
                            <SubjectList
                                courseCode={selectedCourse.code}
                                year={selectedYear}
                                semester={selectedSemester}
                                onSubjectSelect={handleSubjectSelect}
                                // onReset prop for SubjectList is now handled by the specific back button below
                            />
                            {/* BACK BUTTON for Subject List -> Semester List */}
                            <button onClick={() => setSelectedSemester(null)} className="back-button">Back to Semester</button>
                        </>
                    )}
                </div>
            );
        }
    };

    return (
        <div className="dashboard-container">
            <TopNavigation onLogout={handleAdminLogout} />
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
                    <WelcomeMessage message="Welcome, Admin! Navigate or search to manage materials." />
                )}


                <div className="search-bar-container">
                    {!selectedSubject && (
                    <input
                        type="text"
                        placeholder="Search for subjects..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="search-input"
                    />
                    )}
                </div>

                {/* Render the appropriate content based on state */}
                {renderContent()}

                {/* Admin-specific action buttons - now moved down */}
                {selectedContext && selectedContext.subject && !showAddMaterialForm && !showManageMaterialsPanel && (
                    <div className="admin-actions-bottom">
                        <button
                            className="admin-action-button"
                            onClick={handleAddMaterialClick}  >
                            Add New Material for {selectedContext.subject}
                        </button>
                        
                        <button
                            className="admin-action-button"
                            onClick={handleManageMaterialsClick} >
                            Manage Materials for {selectedContext.subject}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}

export default AdminDashboardLayout;