"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ToastContainer from "@/components/Toast";

type Task = {
	_id: string;
	title: string;
	description?: string;
	status: "pending" | "completed";
	createdAt: string;
};

type Filter = "all" | "pending" | "completed";

function TasksPageContent() {
	const queryClient = useQueryClient();
	const { user, logout } = useAuth();
	const { showToast } = useToast();
	const [filter, setFilter] = useState<Filter>("all");
	const [title, setTitle] = useState("");
	const [description, setDescription] = useState("");
	const [isAddingTask, setIsAddingTask] = useState(false);
	const [editingTask, setEditingTask] = useState<Task | null>(null);
	const [editTitle, setEditTitle] = useState("");
	const [editDescription, setEditDescription] = useState("");
	const [deleteConfirmTask, setDeleteConfirmTask] = useState<Task | null>(null);

	const { data, isLoading, isError } = useQuery({
		queryKey: ["tasks"],
		queryFn: async () => (await api.get<Task[]>("/tasks")).data,
	});

	const createTask = useMutation({
		mutationFn: async (body: { title: string; description?: string }) =>
			(await api.post("/tasks", body)).data,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			setTitle("");
			setDescription("");
			setIsAddingTask(false);
			showToast('success', 'Task Created!', 'Your new task has been added successfully.');
		},
		onError: (error: any) => {
			showToast('error', 'Failed to Create Task', error?.response?.data?.message || 'Something went wrong. Please try again.');
		},
	});

	const updateTask = useMutation({
		mutationFn: async ({ id, body }: { id: string; body: Partial<Task> }) =>
			(await api.put(`/tasks/${id}`, body)).data,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			setEditingTask(null);
			setEditTitle("");
			setEditDescription("");
			showToast('warning', 'Task Updated!', 'Your task has been updated successfully.');
		},
		onError: (error: any) => {			
			showToast('error', 'Failed to Update Task', error?.response?.data?.message || 'Something went wrong. Please try again.');
		},
	});

	const deleteTask = useMutation({
		mutationFn: async (id: string) => (await api.delete(`/tasks/${id}`)).data,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			setDeleteConfirmTask(null);
			showToast('error', 'Task Deleted!', 'The task has been removed successfully.');
		},
		onError: (error: any) => {
			showToast('error', 'Failed to Delete Task', error?.response?.data?.message || 'Something went wrong. Please try again.');
		},
	});

	const toggleTask = useMutation({
		mutationFn: async (id: string) => (await api.patch(`/tasks/${id}/toggle`)).data,
		onSuccess: (data) => {
			queryClient.invalidateQueries({ queryKey: ["tasks"] });
			const status = data.status === 'completed' ? 'completed' : 'pending';
			showToast('success', `Task ${status}!`, `Task has been marked as ${status}.`);
		},
		onError: (error: any) => {
			showToast('error', 'Failed to Update Status', error?.response?.data?.message || 'Something went wrong. Please try again.');
		},
	});

	const filtered = useMemo(() => {
		if (!data) return [] as Task[];
		if (filter === "all") return data;
		return data.filter((t) => t.status === filter);
	}, [data, filter]);

	// Calculate task counts for each status
	const taskCounts = useMemo(() => {
		if (!data) return { all: 0, pending: 0, completed: 0 };
		return {
			all: data.length,
			pending: data.filter(t => t.status === "pending").length,
			completed: data.filter(t => t.status === "completed").length
		};
	}, [data]);

	const onAdd = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!title.trim()) return;
		await createTask.mutateAsync({ title: title.trim(), description: description.trim() });
	};

	const handleEdit = (task: Task) => {
		setEditingTask(task);
		setEditTitle(task.title);
		setEditDescription(task.description || "");
	};

	const handleSaveEdit = async () => {
		if (!editingTask || !editTitle.trim()) return;
		await updateTask.mutateAsync({
			id: editingTask._id,
			body: { title: editTitle.trim(), description: editDescription.trim() }
		});
	};

	const handleCancelEdit = () => {
		setEditingTask(null);
		setEditTitle("");
		setEditDescription("");
	};

	const handleDeleteClick = (task: Task) => {
		setDeleteConfirmTask(task);
	};

	const handleConfirmDelete = async () => {
		if (deleteConfirmTask) {
			await deleteTask.mutateAsync(deleteConfirmTask._id);
		}
	};

	const handleCancelDelete = () => {
		setDeleteConfirmTask(null);
	};

	const handleLogout = async () => {
		await logout();
	};

	const handleToggleTask = (taskId: string) => {
		toggleTask.mutate(taskId);
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString('en-US', {
			month: 'short',
			day: 'numeric',
			year: 'numeric'
		});
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
			{/* Header */}
			<div className="bg-white shadow-sm border-b">
				<div className="max-w-6xl mx-auto px-4 py-6">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-3xl font-bold text-gray-900">Task Manager</h1>
							<p className="text-gray-600 mt-1">Organize your life, one task at a time</p>
						</div>
						<div className="flex items-center gap-4">
							<div className="text-right">
								<p className="text-sm text-gray-600">Welcome back,</p>
								<p className="font-medium text-gray-900">{user?.email}</p>
							</div>
							<button 
								onClick={handleLogout}
								className="px-4 py-2 border border-red-600 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
							>
								Logout
							</button>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-6xl mx-auto px-4 py-8">
				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div className="bg-white rounded-xl shadow-sm p-6 border">
						<div className="flex items-center">
							<div className="p-3 bg-blue-100 rounded-lg">
								<svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
								</svg>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Total Tasks</p>
								<p className="text-2xl font-bold text-gray-900">{taskCounts.all}</p>
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl shadow-sm p-6 border">
						<div className="flex items-center">
							<div className="p-3 bg-yellow-100 rounded-lg">
								<svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Pending</p>
								<p className="text-2xl font-bold text-gray-900">{taskCounts.pending}</p>
							</div>
						</div>
					</div>
					<div className="bg-white rounded-xl shadow-sm p-6 border">
						<div className="flex items-center">
							<div className="p-3 bg-green-100 rounded-lg">
								<svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-900">Completed</p>
								<p className="text-2xl font-bold text-gray-900">{taskCounts.completed}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Add Task Section */}
				<div className="bg-white rounded-xl shadow-sm border mb-8">
					<div className="p-6">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-xl font-semibold text-gray-900">Add New Task</h2>
							<button
								onClick={() => setIsAddingTask(!isAddingTask)}
								className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
							>
								{isAddingTask ? (
									<>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
										</svg>
										Cancel
									</>
								) : (
									<>
										<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
										</svg>
										Add Task
									</>
								)}
							</button>
						</div>
						
						{isAddingTask && (
							<form onSubmit={onAdd} className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Task Title *</label>
									<input
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
										placeholder="What needs to be done?"
										value={title}
										onChange={(e) => setTitle(e.target.value)}
										required
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
									<textarea
										className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
										placeholder="Add more details about this task..."
										rows={3}
										value={description}
										onChange={(e) => setDescription(e.target.value)}
									/>
								</div>
								<div className="flex gap-3">
									<button 
										type="submit" 
										className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
										disabled={createTask.isPending || !title.trim()}
									>
										{createTask.isPending ? (
											<div className="flex items-center gap-2">
												<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
												Adding...
											</div>
										) : (
											"Create Task"
										)}
									</button>
									<button 
										type="button" 
										onClick={() => setIsAddingTask(false)}
										className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
									>
										Cancel
									</button>
								</div>
							</form>
						)}
					</div>
				</div>

				{/* Filter Section */}
				<div className="bg-white rounded-xl shadow-sm border mb-8">
					<div className="p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-4">Filter Tasks</h3>
						<div className="flex flex-wrap gap-3">
							{(["all", "pending", "completed"] as const).map((f) => (
								<button
									key={f}
									className={`px-6 py-3 rounded-lg border-2 transition-all ${
										filter === f 
											? "bg-blue-600 text-white border-blue-600 shadow-lg transform scale-105" 
											: "bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50"
									}`}
									onClick={() => setFilter(f)}
								>
									<span className="capitalize font-medium">{f}</span>
									<span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
										filter === f 
											? "bg-white text-blue-600" 
											: "bg-gray-100 text-gray-600"
									}`}>
										{taskCounts[f]}
									</span>
								</button>
							))}
						</div>
						
						{/* Summary */}
						<div className="mt-4 text-sm text-gray-600">
							Showing <span className="font-medium">{filtered.length}</span> of <span className="font-medium">{taskCounts.all}</span> tasks
							{filter !== "all" && ` (${filter} tasks)`}
						</div>
					</div>
				</div>

				{/* Tasks List */}
				<div className="bg-white rounded-xl shadow-sm border">
					<div className="p-6">
						<h3 className="text-lg font-semibold text-gray-900 mb-6">Your Tasks</h3>
						
						{isLoading ? (
							<div className="text-center py-12">
								<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
								<p className="mt-4 text-gray-600">Loading your tasks...</p>
							</div>
						) : isError ? (
							<div className="text-center py-12">
								<div className="p-4 bg-red-50 rounded-lg">
									<svg className="w-12 h-12 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
									</svg>
									<p className="text-red-600 font-medium">Failed to load tasks</p>
									<p className="text-red-500 text-sm mt-1">Please try refreshing the page</p>
								</div>
							</div>
						) : filtered.length === 0 ? (
							<div className="text-center py-12">
								<div className="p-4">
									<svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
									</svg>
									<p className="text-gray-500 text-lg font-medium">
										{filter === "all" ? "No tasks yet!" : `No ${filter} tasks found`}
									</p>
									<p className="text-gray-400 mt-1">
										{filter === "all" ? "Create your first task to get started" : "Try changing the filter or create a new task"}
									</p>
								</div>
							</div>
						) : (
							<div className="space-y-4">
								{filtered.map((task) => (
									<div 
										key={task._id} 
										className={`border-2 rounded-xl p-6 transition-all hover:shadow-md ${
											task.status === "completed" 
												? "bg-gray-50 border-gray-200" 
												: "bg-white border-gray-200 hover:border-blue-300"
										}`}
									>
										{editingTask?._id === task._id ? (
											// Edit Mode
											<div className="space-y-4">
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
													<input
														className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
														value={editTitle}
														onChange={(e) => setEditTitle(e.target.value)}
													/>
												</div>
												<div>
													<label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
													<textarea
														className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
														rows={3}
														value={editDescription}
														onChange={(e) => setEditDescription(e.target.value)}
													/>
												</div>
												<div className="flex gap-3">
													<button
														onClick={handleSaveEdit}
														className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
														disabled={updateTask.isPending || !editTitle.trim()}
													>
														{updateTask.isPending ? "Saving..." : "Save Changes"}
													</button>
													<button
														onClick={handleCancelEdit}
														className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
													>
														Cancel
													</button>
												</div>
											</div>
										) : (
											// View Mode
											<div className="flex items-start gap-4">
												<div className="flex-shrink-0 mt-1">
													<input
														type="checkbox"
														checked={task.status === "completed"}
														onChange={() => handleToggleTask(task._id)}
														className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
														disabled={toggleTask.isPending}
													/>
												</div>
												
												<div className="flex-1 min-w-0">
													<div className="flex items-start justify-between">
														<div className="flex-1">
															<h4 className={`text-lg font-semibold ${
																task.status === "completed" 
																	? "line-through text-gray-500" 
																	: "text-gray-900"
															}`}>
																{task.title}
															</h4>
															{task.description && (
																<p className={`mt-2 ${
																	task.status === "completed" 
																		? "text-gray-400" 
																		: "text-gray-600"
																}`}>
																	{task.description}
																</p>
															)}
															<div className="flex items-center gap-4 mt-3">
																<span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
																	task.status === "completed"
																		? "bg-green-100 text-green-800"
																		: "bg-yellow-100 text-yellow-800"
																}`}>
																	{task.status === "completed" ? "✓ Completed" : "⏳ Pending"}
																</span>
																<span className="text-xs text-gray-500">
																	Created {formatDate(task.createdAt)}
																</span>
															</div>
														</div>
														
														<div className="flex items-center gap-2 ml-4">
															<button
																onClick={() => handleEdit(task)}
																className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition-colors"
																title="Edit task"
															>
																<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
																</svg>
															</button>
															<button
																onClick={() => handleDeleteClick(task)}
																className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
																title="Delete task"
															>
																<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
																	<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
																</svg>
															</button>
														</div>
													</div>
												</div>
											</div>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			{deleteConfirmTask && (
				<div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50">
					<div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6">
						<div className="flex items-center gap-3 mb-4">
							<div className="p-2 bg-red-100 rounded-lg">
								<svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
								</svg>
							</div>
							<h3 className="text-lg font-semibold text-gray-900">Delete Task</h3>
						</div>
						
						<p className="text-gray-600 mb-6">
							Are you sure you want to delete <span className="font-medium text-gray-900">"{deleteConfirmTask.title}"</span>? 
						</p>
						
						<div className="flex gap-3">
							<button
								onClick={handleConfirmDelete}
								disabled={deleteTask.isPending}
								className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
							>
								{deleteTask.isPending ? (
									<div className="flex items-center gap-2">
										<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
										Deleting...
									</div>
								) : (
									"Delete Task"
								)}
							</button>
							<button
								onClick={handleCancelDelete}
								disabled={deleteTask.isPending}
								className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:cursor-not-allowed"
							>
								Cancel
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default function TasksPage() {
	const { toasts, removeToast } = useToast();
	
	return (
		<ProtectedRoute>
			<TasksPageContent />
			<ToastContainer toasts={toasts} onRemove={removeToast} />
		</ProtectedRoute>
	);
}
