import React, { useState, useEffect } from 'react';
import { Users, FileQuestion, Upload, Database, Activity } from 'lucide-react';
import api from '../../services/api';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('users');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (error) {
            console.error("Failed to fetch users", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] bg-gray-50 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white shadow-sm border-r border-gray-200 hidden md:block">
                <div className="p-6">
                    <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        Admin Controls
                    </h2>
                    <nav className="mt-6 flex flex-col space-y-2">
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'users' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            <Users className="h-5 w-5" />
                            Manage Users
                        </button>
                        <button
                            onClick={() => setActiveTab('rag')}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'rag' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            <Database className="h-5 w-5" />
                            AI Knowledge Base
                        </button>
                        <button
                            onClick={() => setActiveTab('analytics')}
                            className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === 'analytics' ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}
                        >
                            <Activity className="h-5 w-5" />
                            Chat Analytics
                        </button>
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 p-8">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                        <p className="text-sm text-gray-500 mt-1">Manage portal settings and AI integrations</p>
                    </div>
                </header>

                {activeTab === 'users' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200 flex justify-between items-center bg-gray-50/50">
                            <h3 className="text-lg font-semibold text-gray-800">System Users</h3>
                            <button className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                                + Add User
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="p-8 text-center text-gray-500">Loading users...</div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
                                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {users.length > 0 ? (
                                            users.map((u) => (
                                                <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.email}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${u.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                                u.role === 'faculty' ? 'bg-purple-100 text-purple-800' :
                                                                    'bg-green-100 text-green-800'}`}>
                                                            {u.role}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {new Date(u.created_at).toLocaleDateString()}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button className="text-indigo-600 hover:text-indigo-900">Edit</button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                                                    No users found. Ensure the database is seeded.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'rag' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
                        <div className="flex items-start gap-4 mb-8">
                            <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                                <Database className="h-6 w-6" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-gray-900">Knowledge Base Ingestion</h3>
                                <p className="text-gray-500 text-sm mt-1">Upload PDF prospectuses, syllabi, or handbooks to feed the LLM via ChromaDB.</p>
                            </div>
                        </div>

                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center hover:bg-gray-50 transition-colors cursor-pointer group">
                            <Upload className="mx-auto h-12 w-12 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                            <div className="mt-4 flex text-sm text-gray-600 justify-center">
                                <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none px-2">
                                    <span>Upload a file</span>
                                    <input id="file-upload" name="file-upload" type="file" className="sr-only" accept=".pdf" disabled />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">PDF up to 10MB</p>

                            <div className="mt-6">
                                <button
                                    disabled
                                    className="bg-indigo-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Process & Ingest to ChromaDB
                                </button>
                            </div>
                        </div>

                        <div className="mt-8 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <FileQuestion className="h-5 w-5 text-blue-400" />
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-blue-800">How this works</h3>
                                    <div className="mt-2 text-sm text-blue-700 space-y-1">
                                        <p>1. PDF is uploaded to `data/uploads/`</p>
                                        <p>2. Backend Langchain script uses PyPDFLoader to extract text</p>
                                        <p>3. HuggingFace Embeddings convert text to vectors</p>
                                        <p>4. Saved permanently to local ChromaDB for chatbot retrieval</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                        <Activity className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900">Chat Analytics</h3>
                        <p className="text-gray-500 mt-2 text-sm">Monitor LLM token usage and frequently asked questions.</p>
                        <p className="text-gray-400 mt-4 text-xs italic">Feature coming soon in Phase 6.</p>
                    </div>
                )}

            </main>
        </div>
    );
};

export default AdminDashboard;
