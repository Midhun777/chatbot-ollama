import React, { useState } from 'react';
import { CalendarCheck, FileSpreadsheet, Users, BookOpen } from 'lucide-react';

const FacultyDashboard = () => {
    const [activeTab, setActiveTab] = useState('attendance');

    // Mock Data
    const courses = [
        { id: 1, name: "Data Structures", code: "CS201", semester: 3 },
        { id: 2, name: "Web Technologies", code: "CS305", semester: 4 }
    ];

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Faculty Portal</h1>
                <p className="text-sm text-gray-500 mt-1">Manage your assigned courses, mark attendance, and upload grades.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Nav */}
                <div className="w-full md:w-64 flex flex-col gap-2">
                    <button
                        onClick={() => setActiveTab('attendance')}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'attendance' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 bg-white border border-gray-200'}`}
                    >
                        <CalendarCheck className="h-5 w-5" />
                        Mark Attendance
                    </button>

                    <button
                        onClick={() => setActiveTab('marks')}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'marks' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 bg-white border border-gray-200'}`}
                    >
                        <FileSpreadsheet className="h-5 w-5" />
                        Upload Marks
                    </button>

                    <button
                        onClick={() => setActiveTab('materials')}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'materials' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-600 hover:bg-gray-100 bg-white border border-gray-200'}`}
                    >
                        <BookOpen className="h-5 w-5" />
                        Course Materials
                    </button>
                </div>

                {/* Main Workspace */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-200 p-6 min-h-[500px]">

                    {activeTab === 'attendance' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Daily Attendance Entry</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                                    <select className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border">
                                        <option value="">Select a course...</option>
                                        {courses.map(c => (
                                            <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                                    <input type="date" className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" defaultValue={new Date().toISOString().split('T')[0]} />
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                                <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">Select a course to load the student roster.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'marks' && (
                        <div>
                            <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Grade Uploads</h2>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Select Course</label>
                                    <select className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border">
                                        <option value="">Select a course...</option>
                                        {courses.map(c => (
                                            <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Exam Type</label>
                                    <select className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border">
                                        <option>Mid-Semester</option>
                                        <option>End-Semester</option>
                                        <option>Internal Assignment</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Marks</label>
                                    <input type="number" className="w-full border-gray-300 rounded-lg shadow-sm focus:border-indigo-500 focus:ring-indigo-500 p-2 border" defaultValue="100" />
                                </div>
                            </div>

                            <div className="bg-gray-50 rounded-lg border border-gray-200 p-8 text-center">
                                <FileSpreadsheet className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                <p className="text-gray-500 text-sm">Select a course to begin inputting student marks.</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'materials' && (
                        <div className="text-center py-20">
                            <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-lg font-medium text-gray-900">Upload Study Materials</h3>
                            <p className="text-gray-500 mt-1 text-sm">Distribute PDFs and presentations directly to enrolled students.</p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default FacultyDashboard;
