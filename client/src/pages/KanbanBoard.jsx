import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useGetTasksQuery, useMoveTaskMutation } from '../features/tasks/taskAPI';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import Button from '../components/common/Button';
import CreateTaskModal from '../components/modals/CreateTaskModal';
import TaskDetailModal from '../components/modals/TaskDetailModal';
import { FiTrello, FiPlus } from 'react-icons/fi';

const KanbanBoard = () => {
    const { projectId } = useParams();
    const { data: tasksData, isLoading, error } = useGetTasksQuery(projectId);

    // Debug logging
    console.log('=== KANBAN BOARD DEBUG ===');
    console.log('Project ID:', projectId);
    console.log('Tasks Data:', tasksData);
    console.log('Is Loading:', isLoading);
    console.log('Error:', error);

    // Extract tasks with multiple fallbacks
    const tasks = Array.isArray(tasksData?.data?.tasks)
        ? tasksData.data.tasks
        : Array.isArray(tasksData?.data)
            ? tasksData.data
            : Array.isArray(tasksData?.tasks)
                ? tasksData.tasks
                : [];


    console.log('Extracted tasks:', tasks);
    console.log('Tasks count:', tasks.length);

    // State for modals and task selection
    const [moveTask] = useMoveTaskMutation();
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState(null);
    const [selectedColumn, setSelectedColumn] = useState('Todo');

    const columns = [
        { id: 'Todo', title: 'To Do', color: 'bg-gray-200' },
        { id: 'In Progress', title: 'In Progress', color: 'bg-blue-200' },
        { id: 'In Review', title: 'In Review', color: 'bg-purple-200' },
        { id: 'Done', title: 'Done', color: 'bg-green-200' },
    ];

    const getTasksByColumn = (columnId) => {
        // Only check column field - tasks should only appear in ONE column!
        return tasks.filter((task) => task.column === columnId);
    };

    const handleDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;
        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        try {
            await moveTask({
                id: draggableId,
                column: destination.droppableId,
                position: destination.index,
            }).unwrap();
        } catch (error) {
            console.error('Failed to move task:', error);
        }
    };

    const handleCreateTask = (columnId) => {
        setSelectedColumn(columnId);
        setShowCreateModal(true);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <LoadingSpinner size="lg" />
            </div>
        );
    }

    if (!projectId) {
        return (
            <EmptyState
                icon={FiTrello}
                title="No project selected"
                description="Please select a project to view its Kanban board"
            />
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">Kanban Board</h1>
                <Button onClick={() => handleCreateTask('Todo')}>
                    <FiPlus className="w-4 h-4 mr-2" />
                    New Task
                </Button>
            </div>

            {tasks.length === 0 ? (
                <EmptyState
                    icon={FiTrello}
                    title="No tasks yet"
                    description="Create your first task to get started"
                    action={
                        <Button onClick={() => handleCreateTask('Todo')}>
                            <FiPlus className="w-4 h-4 mr-2" />
                            Create Task
                        </Button>
                    }
                />
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {columns.map((column) => (
                            <Droppable key={column.id} droppableId={column.id}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className={`rounded-lg p-4 ${snapshot.isDraggingOver ? 'bg-gray-100' : 'bg-gray-50'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-3 h-3 rounded-full ${column.color}`} />
                                                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                                                <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                                                    {getTasksByColumn(column.id).length}
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => handleCreateTask(column.id)}
                                                className="text-gray-400 hover:text-gray-600"
                                            >
                                                <FiPlus className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="space-y-3 min-h-[200px]">
                                            {getTasksByColumn(column.id).map((task, index) => (
                                                <Draggable
                                                    key={task._id}
                                                    draggableId={task._id}
                                                    index={index}
                                                >
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.draggableProps}
                                                            {...provided.dragHandleProps}
                                                            onClick={() => {
                                                                setSelectedTaskId(task._id);
                                                                setShowDetailModal(true);
                                                            }}
                                                            className={`bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer ${snapshot.isDragging ? 'shadow-lg' : ''
                                                                }`}
                                                        >
                                                            <h4 className="font-medium text-gray-900 text-sm mb-2">
                                                                {task.title}
                                                            </h4>
                                                            {task.description && (
                                                                <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                                                                    {task.description}
                                                                </p>
                                                            )}
                                                            <div className="flex items-center justify-between">
                                                                {task.priority && (
                                                                    <span
                                                                        className={`inline-block text-xs px-2 py-1 rounded ${getPriorityColor(
                                                                            task.priority
                                                                        )}`}
                                                                    >
                                                                        {task.priority}
                                                                    </span>
                                                                )}
                                                                {task.assignedTo?.name && (
                                                                    <div className="w-6 h-6 bg-primary-500 rounded-full flex items-center justify-center text-xs text-white">
                                                                        {task.assignedTo.name.charAt(0)}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </Draggable>
                                            ))}
                                            {provided.placeholder}
                                        </div>
                                    </div>
                                )}
                            </Droppable>
                        ))}
                    </div>
                </DragDropContext>
            )}

            <CreateTaskModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                projectId={projectId}
                initialColumn={selectedColumn}
            />

            <TaskDetailModal
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
                taskId={selectedTaskId}
            />
        </div>
    );
};

const getPriorityColor = (priority) => {
    const colors = {
        Low: 'bg-green-100 text-green-700',
        Medium: 'bg-yellow-100 text-yellow-700',
        High: 'bg-orange-100 text-orange-700',
        Critical: 'bg-red-100 text-red-700',
    };
    return colors[priority] || 'bg-gray-100 text-gray-700';
};

export default KanbanBoard;
