// Habit Tracker Application
class HabitTracker {
    constructor() {
        this.habits = this.loadHabits();
        this.currentEditingHabit = null;
        this.currentEntryDate = null;
        this.currentEntryHabit = null;
        this.currentDeleteHabit = null;
        this.currentTooltip = null;
        this.initTheme();
        
        // Data from the provided JSON
        this.metricTypes = [
            {"label": "None (Yes/No)", "value": "none", "unit": ""},
            {"label": "Minutes", "value": "minutes", "unit": "minute"},
            {"label": "Hours", "value": "hours", "unit": "hour"},
            {"label": "Kilometers", "value": "kilometers", "unit": "km"},
            {"label": "Steps", "value": "steps", "unit": "step"},
            {"label": "Pages", "value": "pages", "unit": "page"},
            {"label": "Glasses", "value": "glasses", "unit": "glass"},
            {"label": "Repetitions", "value": "reps", "unit": "rep"}
        ];
        
        this.colorOptions = [
            {"name": "Lemonade", "value": "#FFD700", "class": "lemonade"},
            {"name": "Ocean", "value": "#0077BE", "class": "ocean"},
            {"name": "Forest", "value": "#228B22", "class": "forest"},
            {"name": "Sunset", "value": "#FF6347", "class": "sunset"},
            {"name": "Lavender", "value": "#9370DB", "class": "lavender"},
            {"name": "Mint", "value": "#98FB98", "class": "mint"}
        ];
        
        this.statisticsOptions = [
            {
                "id": "streak",
                "label": "Streak",
                "description": "Number of consecutive entries. Resets to 0 if a day is missed."
            },
            {
                "id": "longestStreak", 
                "label": "Longest streak",
                "description": "Longest streak ever recorded."
            },
            {
                "id": "average",
                "label": "Average", 
                "description": "Statistical average of your entries."
            },
            {
                "id": "standardDeviation",
                "label": "Standard deviation",
                "description": "Statistical measure of dispersion, how much your entries vary."
            },
            {
                "id": "total",
                "label": "Total",
                "description": "Sum of all your entries."
            },
            {
                "id": "numberOfDays",
                "label": "Number of days",
                "description": "Number of entries recorded."
            }
        ];
        
        this.init();
    }

    initTheme() {
        const savedTheme = localStorage.getItem('habitTracker_theme');
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
        this.applyTheme(currentTheme);
    }

    applyTheme(theme) {
        document.documentElement.setAttribute('data-color-scheme', theme);
        localStorage.setItem('habitTracker_theme', theme);
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-color-scheme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        this.applyTheme(newTheme);
    }

    exportData() {
        const data = JSON.stringify(this.habits, null, 2);
        const blob = new Blob([data], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'habit-tracker-backup.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importData(event) {
        const file = event.target.files[0];
        if (!file) {
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedHabits = JSON.parse(e.target.result);
                if (Array.isArray(importedHabits)) {
                    this.habits = importedHabits;
                    this.saveHabits();
                    this.updateUI();
                    alert('Data imported successfully!');
                } else {
                    alert('Invalid file format.');
                }
            } catch (error) {
                alert('Error reading or parsing the file.');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
        // Reset the input value to allow importing the same file again
        event.target.value = null;
    }
    
    init() {
        // Ensure DOM is fully loaded before setting up
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.setupEventListeners();
                this.populateFormOptions();
                this.updateUI();
            });
        } else {
            this.setupEventListeners();
            this.populateFormOptions();
            this.updateUI();
        }
    }
    
    // Data Management
    loadHabits() {
        try {
            const stored = localStorage.getItem('habitTracker_habits');
            return stored ? JSON.parse(stored) : [];
        } catch (e) {
            console.error('Error loading habits:', e);
            return [];
        }
    }
    
    saveHabits() {
        try {
            localStorage.setItem('habitTracker_habits', JSON.stringify(this.habits));
        } catch (e) {
            console.error('Error saving habits:', e);
        }
    }
    
    // Event Listeners
    setupEventListeners() {
        // Create habit buttons
        const createHabitBtn = document.getElementById('createHabitBtn');
        const createFirstHabitBtn = document.getElementById('createFirstHabitBtn');
        
        if (createHabitBtn) {
            createHabitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openCreateModal();
            });
        }
        
        if (createFirstHabitBtn) {
            createFirstHabitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.openCreateModal();
            });
        }
        
        // Modal close buttons
        const closeModal = document.getElementById('closeModal');
        const closeEntryModal = document.getElementById('closeEntryModal');
        const closeDeleteModal = document.getElementById('closeDeleteModal');
        
        if (closeModal) {
            closeModal.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeModal('createHabitModal');
            });
        }
        
        if (closeEntryModal) {
            closeEntryModal.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeModal('entryModal');
            });
        }
        
        if (closeDeleteModal) {
            closeDeleteModal.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.closeModal('deleteModal');
            });
        }
        
        // Form submissions
        const habitForm = document.getElementById('habitForm');
        const entryForm = document.getElementById('entryForm');
        
        if (habitForm) {
            habitForm.addEventListener('submit', (e) => this.handleHabitSubmit(e));
        }
        
        if (entryForm) {
            entryForm.addEventListener('submit', (e) => this.handleEntrySubmit(e));
        }
        
        // Cancel buttons
        const cancelBtn = document.getElementById('cancelBtn');
        const cancelEntryBtn = document.getElementById('cancelEntryBtn');
        const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');
        const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal('createHabitModal');
            });
        }
        
        if (cancelEntryBtn) {
            cancelEntryBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal('entryModal');
            });
        }
        
        if (cancelDeleteBtn) {
            cancelDeleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.closeModal('deleteModal');
            });
        }
        
        if (confirmDeleteBtn) {
            confirmDeleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.confirmDelete();
            });
        }
        
        // Modal backdrop clicks - but not on dropdown interactions
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }

            // Close open dropdowns
            if (!e.target.closest('.habit-card-actions')) {
                document.querySelectorAll('.dropdown-menu:not(.hidden)').forEach(menu => {
                    menu.classList.add('hidden');
                });
            }
        });
        
        // ESC key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const openModal = document.querySelector('.modal.show');
                if (openModal) {
                    this.closeModal(openModal.id);
                }
            }
        });

        // Theme switcher
        const themeSwitcherBtn = document.getElementById('themeSwitcherBtn');
        if (themeSwitcherBtn) {
            themeSwitcherBtn.addEventListener('click', () => this.toggleTheme());
        }

        // Export button
        const exportBtn = document.getElementById('exportBtn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => this.exportData());
        }

        // Import button and file input
        const importBtn = document.getElementById('importBtn');
        const importInput = document.getElementById('importInput');
        if (importBtn && importInput) {
            importBtn.addEventListener('click', () => importInput.click());
            importInput.addEventListener('change', (e) => this.importData(e));
        }
    }
    
    populateFormOptions() {
        // Populate metric types
        const metricSelect = document.getElementById('metricType');
        if (metricSelect) {
            metricSelect.innerHTML = ''; // Clear existing options
            this.metricTypes.forEach(metric => {
                const option = document.createElement('option');
                option.value = metric.value;
                option.textContent = metric.label;
                metricSelect.appendChild(option);
            });
            
            // Add change listener for preview updates
            metricSelect.addEventListener('change', () => this.updatePreview());
        }
        
        // Populate statistics options
        const statsContainer = document.getElementById('statisticsOptions');
        if (statsContainer) {
            statsContainer.innerHTML = ''; // Clear existing options
            this.statisticsOptions.forEach(stat => {
                const div = document.createElement('div');
                div.className = 'stat-option';
                div.innerHTML = `
                    <input type="checkbox" id="stat_${stat.id}" value="${stat.id}" checked>
                    <div class="stat-option-content">
                        <label for="stat_${stat.id}" class="stat-option-label">${stat.label}</label>
                        <div class="stat-option-description">${stat.description}</div>
                    </div>
                `;
                statsContainer.appendChild(div);
                
                // Add event listener to checkbox
                const checkbox = div.querySelector('input');
                if (checkbox) {
                    checkbox.addEventListener('change', () => this.updatePreview());
                }
                
                // Make the whole div clickable
                div.addEventListener('click', (e) => {
                    if (e.target !== checkbox) {
                        checkbox.checked = !checkbox.checked;
                        this.updatePreview();
                    }
                });
            });
        }
        
        // Populate color picker
        const colorPicker = document.getElementById('colorPicker');
        if (colorPicker) {
            colorPicker.innerHTML = ''; // Clear existing options
            this.colorOptions.forEach((color, index) => {
                const div = document.createElement('div');
                div.className = `color-option color-${color.class} ${index === 0 ? 'selected' : ''}`;
                div.dataset.color = color.class;
                div.addEventListener('click', () => this.selectColor(color.class));
                colorPicker.appendChild(div);
            });
        }
        
        // Set up form field listeners for live preview
        const habitName = document.getElementById('habitName');
        const startDay = document.getElementById('startDay');
        
        if (habitName) {
            habitName.addEventListener('input', () => this.updatePreview());
        }
        
        if (startDay) {
            startDay.addEventListener('change', () => this.updatePreview());
        }
        
        // Privacy radio buttons
        const privacyRadios = document.querySelectorAll('input[name="privacy"]');
        privacyRadios.forEach(radio => {
            radio.addEventListener('change', () => this.updatePreview());
        });
    }
    
    // UI Updates
    updateUI() {
        const emptyState = document.getElementById('emptyState');
        const habitsGrid = document.getElementById('habitsGrid');
        
        if (!emptyState || !habitsGrid) return;
        
        if (this.habits.length === 0) {
            emptyState.classList.remove('hidden');
            habitsGrid.classList.add('hidden');
        } else {
            emptyState.classList.add('hidden');
            habitsGrid.classList.remove('hidden');
            this.renderHabits();
        }
    }
    
    renderHabits() {
        const grid = document.getElementById('habitsGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        this.habits.forEach(habit => {
            const card = this.createHabitCard(habit);
            grid.appendChild(card);
        });
    }
    
    createHabitCard(habit) {
        const card = document.createElement('div');
        card.className = 'habit-card';
        card.dataset.habitId = habit.id;

        const metricInfo = this.getMetricInfo(habit.metric.type);
        const stats = this.calculateStats(habit);

        card.innerHTML = `
            <div class="habit-card-header">
                <div class="habit-card-info">
                    <h3>${habit.name}</h3>
                    <div class="metric-info">${metricInfo.label}</div>
                </div>
                <div class="habit-card-actions">
                    <button class="menu-toggle-btn" aria-label="Options">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"></circle><circle cx="19" cy="12" r="1"></circle><circle cx="5" cy="12" r="1"></circle></svg>
                    </button>
                    <div class="dropdown-menu hidden">
                        <button class="dropdown-item edit-btn" data-habit-id="${habit.id}">Edit</button>
                        <button class="dropdown-item delete-btn" data-habit-id="${habit.id}">Delete</button>
                    </div>
                </div>
            </div>
            <div class="heatmap-container">
                ${this.createHeatmap(habit)}
            </div>
            <div class="stats-container">
                ${this.createStatsDisplay(habit, stats)}
            </div>
        `;

        // Add event listeners
        const menuToggleBtn = card.querySelector('.menu-toggle-btn');
        const dropdownMenu = card.querySelector('.dropdown-menu');
        const editBtn = card.querySelector('.edit-btn');
        const deleteBtn = card.querySelector('.delete-btn');

        if (menuToggleBtn) {
            menuToggleBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                // Close other open menus
                document.querySelectorAll('.dropdown-menu:not(.hidden)').forEach(menu => {
                    if (menu !== dropdownMenu) {
                        menu.classList.add('hidden');
                    }
                });
                dropdownMenu.classList.toggle('hidden');
            });
        }

        if (editBtn) {
            editBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.editHabit(habit.id);
            });
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.deleteHabit(habit.id);
            });
        }

        return card;
    }
    
    createHeatmap(habit) {
        let finalHtml = '';
        const today = new Date();
        const currentYear = today.getFullYear();

        // Create a container for all the month grids
        finalHtml += '<div class="heatmap-months-container">';

        // Loop through the months of the current year
        for (let month = 0; month < 12; month++) {
            const date = new Date(currentYear, month, 1);
            const monthName = date.toLocaleString('default', { month: 'short' });

            let monthHtml = `<div class="month-grid">`;
            monthHtml += `<div class="month-label">${monthName}</div>`;
            monthHtml += `<div class="day-grid">`;

            const firstDay = date.getDay(); // 0=Sun, 1=Mon...
            const daysInMonth = new Date(currentYear, month + 1, 0).getDate();

            // Add empty cells for padding
            for (let j = 0; j < firstDay; j++) {
                monthHtml += '<div class="heatmap-cell empty"></div>';
            }

            // Add day cells
            for (let day = 1; day <= daysInMonth; day++) {
                const currentDate = new Date(currentYear, month, day);
                
                // Don't render future dates
                if (currentDate > today) {
                    monthHtml += '<div class="heatmap-cell empty"></div>';
                    continue;
                }

                const dateStr = this.formatDate(currentDate);
                const hasEntry = habit.entries && habit.entries[dateStr];
                const isToday = this.formatDate(currentDate) === this.formatDate(today);

                const cellClasses = [
                    'heatmap-cell',
                    habit.color,
                    hasEntry ? 'has-entry' : '',
                    isToday ? 'today' : ''
                ].filter(Boolean).join(' ');

                monthHtml += `<div class="${cellClasses}" data-date="${dateStr}" data-habit-id="${habit.id}"></div>`;
            }

            monthHtml += `</div></div>`;
            finalHtml += monthHtml;
        }

        finalHtml += '</div>';

        // Add event listeners after rendering
        setTimeout(() => {
            const cells = document.querySelectorAll(`.habit-card[data-habit-id="${habit.id}"] .heatmap-cell:not(.empty)`)
            cells.forEach(cell => {
                cell.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.openEntryModal(habit.id, cell.dataset.date);
                });

                cell.addEventListener('mouseenter', (e) => {
                    this.showTooltip(e, habit, cell.dataset.date);
                });

                cell.addEventListener('mouseleave', () => {
                    this.hideTooltip();
                });
            });
        }, 0);

        return finalHtml;
    }
    
    createStatsDisplay(habit, stats) {
        let html = '';
        
        habit.selectedStats.forEach(statId => {
            const stat = this.statisticsOptions.find(s => s.id === statId);
            if (stat && stats[statId] !== undefined) {
                const value = this.formatStatValue(stats[statId], habit.metric, statId);
                html += `
                    <div class="stat-item">
                        <span class="stat-value">${value}</span>
                        <div class="stat-label">${stat.label}</div>
                    </div>
                `;
            }
        });
        
        return html;
    }
    
    // Statistics Calculations
    calculateStats(habit) {
        const entries = habit.entries || {};
        const values = Object.values(entries).filter(v => v > 0);
        
        if (values.length === 0) {
            return {
                streak: 0,
                longestStreak: 0,
                average: 0,
                standardDeviation: 0,
                total: 0,
                numberOfDays: 0
            };
        }
        
        const total = values.reduce((sum, val) => sum + val, 0);
        const average = total / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - average, 2), 0) / values.length;
        const standardDeviation = Math.sqrt(variance);
        
        return {
            streak: this.calculateCurrentStreak(habit),
            longestStreak: this.calculateLongestStreak(habit),
            average: average,
            standardDeviation: standardDeviation,
            total: total,
            numberOfDays: values.length
        };
    }
    
    calculateCurrentStreak(habit) {
        const entries = habit.entries || {};
        const today = new Date();
        let streak = 0;

        // Check if today has an entry
        if (entries[this.formatDate(today)]) {
            streak++;
            for (let i = 1; i < 365; i++) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = this.formatDate(date);

                if (entries[dateStr] && entries[dateStr] > 0) {
                    streak++;
                } else {
                    break;
                }
            }
        } else {
            // Check if yesterday has an entry
            const yesterday = new Date(today);
            yesterday.setDate(today.getDate() - 1);
            if (entries[this.formatDate(yesterday)]) {
                streak = 0; // Streak is broken
            } else {
                // If neither today nor yesterday has an entry, the streak is 0.
                streak = 0;
            }
        }

        return streak;
    }
    
    calculateLongestStreak(habit) {
        const entries = habit.entries || {};
        const dates = Object.keys(entries).sort();
        
        let longestStreak = 0;
        let currentStreak = 0;
        let lastDate = null;
        
        dates.forEach(dateStr => {
            if (entries[dateStr] > 0) {
                if (lastDate && this.isConsecutiveDay(lastDate, dateStr)) {
                    currentStreak++;
                } else {
                    currentStreak = 1;
                }
                longestStreak = Math.max(longestStreak, currentStreak);
                lastDate = dateStr;
            } else {
                currentStreak = 0;
            }
        });
        
        return longestStreak;
    }
    
    // Modal Management
    openCreateModal(habitId = null) {
        this.currentEditingHabit = habitId;
        const modal = document.getElementById('createHabitModal');
        const title = document.getElementById('modalTitle');
        
        if (!modal || !title) return;
        
        if (habitId) {
            title.textContent = 'Edit Habit';
            this.populateEditForm(habitId);
        } else {
            title.textContent = 'Create New Habit';
            this.resetForm();
        }
        
        this.showModal(modal);
        setTimeout(() => this.updatePreview(), 100);
    }
    
    openEntryModal(habitId, date) {
        this.currentEntryHabit = habitId;
        this.currentEntryDate = date;
        
        const modal = document.getElementById('entryModal');
        const title = document.getElementById('entryModalTitle');
        const label = document.getElementById('entryValueLabel');
        const input = document.getElementById('entryValue');
        
        if (!modal || !title || !label || !input) return;
        
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        const metricInfo = this.getMetricInfo(habit.metric.type);
        
        title.textContent = `Log ${habit.name} - ${this.formatDisplayDate(date)}`;
        
        if (habit.metric.type === 'none') {
            label.textContent = 'Completed?';
            input.type = 'checkbox';
            input.removeAttribute('min');
            input.removeAttribute('step');
            input.value = '';
        } else {
            label.textContent = `${metricInfo.label} (${habit.metric.unit})`;
            input.type = 'number';
            input.setAttribute('min', '0');
            input.setAttribute('step', '0.1');
        }
        
        // Set current value if exists
        const currentValue = habit.entries && habit.entries[date];
        if (currentValue !== undefined) {
            if (habit.metric.type === 'none') {
                input.checked = currentValue > 0;
            } else {
                input.value = currentValue;
            }
        } else {
            if (habit.metric.type === 'none') {
                input.checked = false;
            } else {
                input.value = '';
            }
        }
        
        this.showModal(modal);
        setTimeout(() => input.focus(), 100);
    }
    
    openDeleteModal(habitId) {
        this.currentDeleteHabit = habitId;
        const modal = document.getElementById('deleteModal');
        if (modal) {
            this.showModal(modal);
        }
    }
    
    showModal(modal) {
        if (!modal) return;
        modal.classList.remove('hidden');
        // Use a small delay to ensure the transition works
        requestAnimationFrame(() => {
            modal.classList.add('show');
        });
    }
    
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.classList.remove('show');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 250);
        
        // Reset current editing state
        if (modalId === 'createHabitModal') {
            this.currentEditingHabit = null;
        } else if (modalId === 'entryModal') {
            this.currentEntryHabit = null;
            this.currentEntryDate = null;
        } else if (modalId === 'deleteModal') {
            this.currentDeleteHabit = null;
        }
    }
    
    // Form Handling
    handleHabitSubmit(e) {
        e.preventDefault();
        
        const habitName = document.getElementById('habitName').value.trim();
        const metricType = document.getElementById('metricType').value;
        const startDay = document.getElementById('startDay').value;
        const privacy = document.querySelector('input[name="privacy"]:checked')?.value || 'public';
        const selectedStats = Array.from(document.querySelectorAll('#statisticsOptions input:checked')).map(cb => cb.value);
        const selectedColor = document.querySelector('.color-option.selected')?.dataset.color || 'lemonade';
        
        if (!habitName) {
            alert('Please enter a habit name');
            return;
        }
        
        const habitData = {
            id: this.currentEditingHabit || this.generateId(),
            name: habitName,
            metric: {
                type: metricType,
                unit: this.getMetricInfo(metricType).unit
            },
            startDay: startDay,
            privacy: privacy,
            color: selectedColor,
            selectedStats: selectedStats,
            entries: this.currentEditingHabit ? this.habits.find(h => h.id === this.currentEditingHabit)?.entries || {} : {}
        };
        
        if (this.currentEditingHabit) {
            const index = this.habits.findIndex(h => h.id === this.currentEditingHabit);
            if (index !== -1) {
                this.habits[index] = habitData;
            }
        } else {
            this.habits.push(habitData);
        }
        
        this.saveHabits();
        this.updateUI();
        this.closeModal('createHabitModal');
    }
    
    handleEntrySubmit(e) {
        e.preventDefault();
        
        const habit = this.habits.find(h => h.id === this.currentEntryHabit);
        if (!habit) return;
        
        const input = document.getElementById('entryValue');
        if (!input) return;
        
        let value;
        if (habit.metric.type === 'none') {
            value = input.checked ? 1 : 0;
        } else {
            value = parseFloat(input.value) || 0;
        }
        
        if (!habit.entries) {
            habit.entries = {};
        }
        
        if (value > 0) {
            habit.entries[this.currentEntryDate] = value;
        } else {
            delete habit.entries[this.currentEntryDate];
        }
        
        this.saveHabits();
        this.updateUI();
        this.closeModal('entryModal');
    }
    
    // Habit Management
    editHabit(habitId) {
        this.openCreateModal(habitId);
    }
    
    deleteHabit(habitId) {
        this.openDeleteModal(habitId);
    }
    
    confirmDelete() {
        if (this.currentDeleteHabit) {
            this.habits = this.habits.filter(h => h.id !== this.currentDeleteHabit);
            this.saveHabits();
            this.updateUI();
            this.closeModal('deleteModal');
        }
    }
    
    populateEditForm(habitId) {
        const habit = this.habits.find(h => h.id === habitId);
        if (!habit) return;
        
        const habitName = document.getElementById('habitName');
        const metricType = document.getElementById('metricType');
        const startDay = document.getElementById('startDay');
        
        if (habitName) habitName.value = habit.name;
        if (metricType) metricType.value = habit.metric.type;
        if (startDay) startDay.value = habit.startDay;
        
        const privacyRadio = document.querySelector(`input[name="privacy"][value="${habit.privacy}"]`);
        if (privacyRadio) privacyRadio.checked = true;
        
        // Select statistics
        document.querySelectorAll('#statisticsOptions input').forEach(cb => {
            cb.checked = habit.selectedStats.includes(cb.value);
        });
        
        // Select color
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.toggle('selected', option.dataset.color === habit.color);
        });
    }
    
    resetForm() {
        const habitForm = document.getElementById('habitForm');
        if (habitForm) {
            habitForm.reset();
        }
        
        document.querySelectorAll('#statisticsOptions input').forEach(cb => cb.checked = true);
        document.querySelectorAll('.color-option').forEach((option, index) => {
            option.classList.toggle('selected', index === 0);
        });
    }
    
    selectColor(colorClass) {
        document.querySelectorAll('.color-option').forEach(option => {
            option.classList.toggle('selected', option.dataset.color === colorClass);
        });
        this.updatePreview();
    }
    
    updatePreview() {
        const habitNameInput = document.getElementById('habitName');
        const metricTypeSelect = document.getElementById('metricType');
        
        if (!habitNameInput || !metricTypeSelect) return;
        
        const habitName = habitNameInput.value || 'Sample Habit';
        const metricType = metricTypeSelect.value || 'none';
        const selectedStats = Array.from(document.querySelectorAll('#statisticsOptions input:checked')).map(cb => cb.value);
        const selectedColorEl = document.querySelector('.color-option.selected');
        const selectedColor = selectedColorEl ? selectedColorEl.dataset.color : 'lemonade';
        
        const previewHabit = {
            id: 'preview',
            name: habitName,
            metric: {
                type: metricType,
                unit: this.getMetricInfo(metricType).unit
            },
            color: selectedColor,
            selectedStats: selectedStats,
            entries: this.generateSampleEntries()
        };
        
        // Update preview heatmap
        const previewHeatmap = document.getElementById('previewHeatmap');
        if (previewHeatmap) {
            previewHeatmap.innerHTML = this.createHeatmap(previewHabit);
        }
        
        // Update preview stats
        const previewStats = document.getElementById('previewStats');
        if (previewStats) {
            const stats = this.calculateStats(previewHabit);
            previewStats.innerHTML = this.createStatsDisplay(previewHabit, stats);
        }
    }
    
    generateSampleEntries() {
        const entries = {};
        const today = new Date();
        
        // Generate some sample entries for the last 365 days
        for (let i = 0; i < 365; i++) {
            if (Math.random() > 0.4) { // 60% chance of entry
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                entries[this.formatDate(date)] = Math.floor(Math.random() * 10) + 1;
            }
        }
        
        return entries;
    }
    
    // Utility Functions
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }
    
    formatDate(date) {
        return date.toISOString().split('T')[0];
    }
    
    formatDisplayDate(dateStr) {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric' 
        });
    }
    
    getMetricInfo(type) {
        return this.metricTypes.find(m => m.value === type) || this.metricTypes[0];
    }
    
    formatStatValue(value, metric, statId) {
        if (statId === 'numberOfDays' || statId === 'streak' || statId === 'longestStreak') {
            return Math.round(value);
        }
        
        if (metric.type === 'none') {
            return Math.round(value);
        }
        
        return value < 10 ? value.toFixed(1) : Math.round(value);
    }
    
    isConsecutiveDay(date1Str, date2Str) {
        const date1 = new Date(date1Str);
        const date2 = new Date(date2Str);
        const diffTime = Math.abs(date2 - date1);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays === 1;
    }
    
    showTooltip(event, habit, dateStr) {
        // Remove any existing tooltip
        this.hideTooltip();
        
        const entry = habit.entries && habit.entries[dateStr];
        const metricInfo = this.getMetricInfo(habit.metric.type);
        
        let tooltipText = this.formatDisplayDate(dateStr);
        if (entry) {
            if (habit.metric.type === 'none') {
                tooltipText += ': Completed';
            } else {
                tooltipText += `: ${entry} ${habit.metric.unit}${entry !== 1 ? 's' : ''}`;
            }
        } else {
            tooltipText += ': No entry';
        }
        
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip show';
        tooltip.textContent = tooltipText;
        tooltip.style.left = event.pageX + 10 + 'px';
        tooltip.style.top = event.pageY - 30 + 'px';
        
        document.body.appendChild(tooltip);
        this.currentTooltip = tooltip;
    }
    
    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new HabitTracker();
});