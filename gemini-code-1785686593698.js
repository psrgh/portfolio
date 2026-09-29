// DOM Elements
const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoPriority = document.getElementById('todo-priority');
const todoDate = document.getElementById('todo-date');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const taskCounter = document.getElementById('task-counter');
const clearCompletedBtn = document.getElementById('clear-completed');
const searchInput = document.getElementById('search-input');
const filterBtns = document.querySelectorAll('.filter-btn');
const themeToggle = document.getElementById('theme-toggle');

// State Management
let todos = JSON.parse(localStorage.getItem('todos')) || [];
let currentFilter = 'all';
let searchQuery = '';

// Theme Toggle Logic
if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    document.documentElement.classList.add('dark');
} else {
    document.documentElement.classList.remove('dark');
}

themeToggle.addEventListener('click', () => {
    document.documentElement.classList.toggle('dark');
    if (document.documentElement.classList.contains('dark')) {
        localStorage.theme = 'dark';
    } else {
        localStorage.theme = 'light';
    }
});

// Save & Render
function saveAndRender() {
    localStorage.setItem('todos', JSON.stringify(todos));
    renderTodos();
}

// Add Task
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value.trim();
    if (!text) return;

    const newTodo = {
        id: Date.now(),
        text: text,
        completed: false,
        priority: todoPriority.value,
        date: todoDate.value || new Date().toISOString().split('T')[0]
    };

    todos.unshift(newTodo);
    todoInput.value = '';
    todoDate.value = '';
    todoPriority.value = 'medium';
    saveAndRender();
});

// Toggle Complete
function toggleTodo(id) {
    todos = todos.map(todo => todo.id === id ? { ...todo, completed: !todo.completed } : todo);
    saveAndRender();
}

// Delete Task
function deleteTodo(id) {
    todos = todos.filter(todo => todo.id !== id);
    saveAndRender();
}

// Filter Handlers
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => {
            b.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
            b.classList.add('text-gray-600', 'dark:text-gray-400');
        });
        e.target.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
        e.target.classList.remove('text-gray-600', 'dark:text-gray-400');
        currentFilter = e.target.getAttribute('data-filter');
        renderTodos();
    });
});

// Search Handler
searchInput.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase();
    renderTodos();
});

// Clear Completed Handler
clearCompletedBtn.addEventListener('click', () => {
    todos = todos.filter(todo => !todo.completed);
    saveAndRender();
});

// Render Function
function renderTodos() {
    // Filter logic
    let filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true;
    });

    // Search logic
    if (searchQuery) {
        filteredTodos = filteredTodos.filter(todo => todo.text.toLowerCase().includes(searchQuery));
    }

    // Empty state check
    if (filteredTodos.length === 0) {
        todoList.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        todoList.innerHTML = filteredTodos.map(todo => {
            // Priority Badge styling
            let priorityBadgeClass = '';
            if (todo.priority === 'high') priorityBadgeClass = 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
            else if (todo.priority === 'medium') priorityBadgeClass = 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
            else priorityBadgeClass = 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400';

            return `
                <div class="group flex items-center justify-between p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700/50 hover:shadow-md transition-all">
                    <div class="flex items-center gap-3 flex-grow min-w-0 mr-4">
                        <input type="checkbox" ${todo.completed ? 'checked' : ''} onclick="toggleTodo(${todo.id})"
                            class="w-5 h-5 rounded-md text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 cursor-pointer transition-all">
                        <span class="text-sm truncate ${todo.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-700 dark:text-gray-200'}">
                            ${escapeHtml(todo.text)}
                        </span>
                    </div>
                    <div class="flex items-center gap-3 flex-shrink-0">
                        <span class="text-xs px-2.5 py-1 rounded-full font-medium ${priorityBadgeClass} capitalize">
                            ${todo.priority}
                        </span>
                        <span class="text-xs text-gray-400 hidden sm:inline">
                            <i class="fa-regular fa-calendar mr-1"></i>${todo.date}
                        </span>
                        <button onclick="deleteTodo(${todo.id})" class="text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1">
                            <i class="fa-solid fa-trash-can text-sm"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Update Counter
    const activeCount = todos.filter(t => !t.completed).length;
    taskCounter.textContent = `${activeCount} task${activeCount === 1 ? '' : 's'} remaining`;
}

// XSS Prevention Utility
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// Initial Render on Load
renderTodos();