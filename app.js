// app.js is no longer used. See niyas.js for the Movies Website implementation.
console.info('Deprecated app.js — use niyas.js instead');

    // Navigation
    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.content-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        document.getElementById(sectionId).classList.add('active');

        // Update sidebar active state
        document.querySelectorAll('.sidebar-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${sectionId}"]`).classList.add('active');

        // Update page title
        const titles = {
            dashboard: 'Dashboard',
            employees: 'Gestion des Employés',
            departments: 'Gestion des Départements',
            statistics: 'Statistiques & API'
        };
        document.getElementById('current-page-title').textContent = titles[sectionId];

        this.currentSection = sectionId;

        // Update department filter when switching to employees section
        if (sectionId === 'employees') {
            this.updateDepartmentFilter();
        }

        // Initialize charts when switching to dashboard
        if (sectionId === 'dashboard') {
            setTimeout(() => this.initializeCharts(), 100);
        }

        // Initialize statistics charts when switching to statistics section
        if (sectionId === 'statistics') {
            setTimeout(() => this.initializeStatisticsCharts(), 100);
        }
    }

    // Time Management
    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        document.getElementById('current-time').textContent = timeString;
    }

    // Dashboard Functions
    updateDashboard() {
        this.updateKPIs();
        this.initializeCharts();
    }

    updateKPIs() {
        // Total employees
        document.getElementById('total-employees').textContent = this.employees.length;

        // Total departments
        document.getElementById('total-departments').textContent = this.departments.length;

        // New employees this month
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const newEmployees = this.employees.filter(emp => {
            const hireDate = new Date(emp.hireDate);
            return hireDate.getMonth() === currentMonth && hireDate.getFullYear() === currentYear;
        });
        document.getElementById('new-employees').textContent = newEmployees.length;

        // API users
        document.getElementById('api-users').textContent = this.apiUsers.length;
    }

    initializeCharts() {
        // Department distribution chart
        const deptCtx = document.getElementById('departmentChart');
        if (deptCtx) {
            const deptData = this.getDepartmentDistribution();
            
            if (this.charts.departmentChart) {
                this.charts.departmentChart.destroy();
            }
            
            this.charts.departmentChart = new Chart(deptCtx, {
                type: 'doughnut',
                data: {
                    labels: deptData.labels,
                    datasets: [{
                        data: deptData.data,
                        backgroundColor: [
                            '#4e73df',
                            '#1cc88a',
                            '#36b9cc',
                            '#f6c23e',
                            '#e74a3b'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }

        // Employee status chart
        const statusCtx = document.getElementById('statusChart');
        if (statusCtx) {
            const statusData = this.getEmployeeStatusDistribution();
            
            if (this.charts.statusChart) {
                this.charts.statusChart.destroy();
            }
            
            this.charts.statusChart = new Chart(statusCtx, {
                type: 'bar',
                data: {
                    labels: statusData.labels,
                    datasets: [{
                        label: 'Nombre d\'employés',
                        data: statusData.data,
                        backgroundColor: '#4e73df'
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                stepSize: 1
                            }
                        }
                    }
                }
            });
        }
    }

    initializeStatisticsCharts() {
        // Evolution chart
        const evolutionCtx = document.getElementById('evolutionChart');
        if (evolutionCtx) {
            const evolutionData = this.getEmployeeEvolution();
            
            if (this.charts.evolutionChart) {
                this.charts.evolutionChart.destroy();
            }
            
            this.charts.evolutionChart = new Chart(evolutionCtx, {
                type: 'line',
                data: {
                    labels: evolutionData.labels,
                    datasets: [{
                        label: 'Total Employés',
                        data: evolutionData.data,
                        borderColor: '#4e73df',
                        backgroundColor: 'rgba(78, 115, 223, 0.1)',
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    scales: {
                        y: {
                            beginAtZero: true
                        }
                    }
                }
            });
        }

        // Top departments chart
        const topDeptCtx = document.getElementById('topDepartmentsChart');
        if (topDeptCtx) {
            const topDeptData = this.getTopDepartments();
            
            if (this.charts.topDepartmentsChart) {
                this.charts.topDepartmentsChart.destroy();
            }
            
            this.charts.topDepartmentsChart = new Chart(topDeptCtx, {
                type: 'pie',
                data: {
                    labels: topDeptData.labels,
                    datasets: [{
                        data: topDeptData.data,
                        backgroundColor: [
                            '#4e73df',
                            '#1cc88a',
                            '#36b9cc',
                            '#f6c23e'
                        ]
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            });
        }
    }

    // Chart Data Functions
    getDepartmentDistribution() {
        const distribution = {};
        this.departments.forEach(dept => {
            distribution[dept.name] = 0;
        });
        
        this.employees.forEach(emp => {
            if (distribution.hasOwnProperty(emp.department)) {
                distribution[emp.department]++;
            }
        });

        return {
            labels: Object.keys(distribution),
            data: Object.values(distribution)
        };
    }

    getEmployeeStatusDistribution() {
        const distribution = {
            'Actif': 0,
            'Congé': 0,
            'Inactif': 0
        };

        this.employees.forEach(emp => {
            if (distribution.hasOwnProperty(emp.status)) {
                distribution[emp.status]++;
            }
        });

        return {
            labels: Object.keys(distribution),
            data: Object.values(distribution)
        };
    }

    getEmployeeEvolution() {
        // Simulate evolution data (last 6 months)
        const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'];
        const data = [5, 8, 12, 15, 18, this.employees.length];
        
        return {
            labels: months,
            data: data
        };
    }

    getTopDepartments() {
        const distribution = this.getDepartmentDistribution();
        const sorted = distribution.labels
            .map((label, index) => ({
                label: label,
                value: distribution.data[index]
            }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 4);

        return {
            labels: sorted.map(item => item.label),
            data: sorted.map(item => item.value)
        };
    }

    // Employee Management
    renderEmployees() {
        const tbody = document.getElementById('employeesTableBody');
        const searchTerm = document.getElementById('employeeSearch').value.toLowerCase();
        const departmentFilter = document.getElementById('departmentFilter').value;
        const sortBy = document.getElementById('sortBy').value;

        let filteredEmployees = this.employees.filter(emp => {
            const matchesSearch = emp.name.toLowerCase().includes(searchTerm) ||
                                emp.email.toLowerCase().includes(searchTerm) ||
                                emp.position.toLowerCase().includes(searchTerm);
            const matchesDepartment = !departmentFilter || emp.department === departmentFilter;
            return matchesSearch && matchesDepartment;
        });

        // Sort employees
        filteredEmployees.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return a.name.localeCompare(b.name);
                case 'department':
                    return a.department.localeCompare(b.department);
                case 'date':
                    return new Date(b.hireDate) - new Date(a.hireDate);
                default:
                    return 0;
            }
        });

        tbody.innerHTML = '';
        
        filteredEmployees.forEach(employee => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${employee.id}</td>
                <td>${employee.name}</td>
                <td>${employee.email}</td>
                <td>${employee.department}</td>
                <td>${employee.position}</td>
                <td>${new Date(employee.hireDate).toLocaleDateString('fr-FR')}</td>
                <td><span class="badge bg-${this.getStatusBadgeClass(employee.status)}">${employee.status}</span></td>
                <td>
                    <button class="btn btn-sm btn-info btn-action" onclick="hrPortal.viewEmployee(${employee.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-warning btn-action" onclick="hrPortal.editEmployee(${employee.id})">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger btn-action" onclick="hrPortal.deleteEmployee(${employee.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    }

    getStatusBadgeClass(status) {
        switch (status) {
            case 'Actif': return 'success';
            case 'Congé': return 'warning';
            case 'Inactif': return 'danger';
            default: return 'secondary';
        }
    }

    saveEmployee() {
        const id = document.getElementById('employeeId').value;
        const employee = {
            id: id ? parseInt(id) : Date.now(),
            name: document.getElementById('employeeName').value,
            email: document.getElementById('employeeEmail').value,
            department: document.getElementById('employeeDepartment').value,
            position: document.getElementById('employeePosition').value,
            status: document.getElementById('employeeStatus').value,
            hireDate: document.getElementById('employeeHireDate').value
        };

        if (id) {
            // Update existing employee
            const index = this.employees.findIndex(emp => emp.id === parseInt(id));
            if (index !== -1) {
                this.employees[index] = employee;
            }
        } else {
            // Add new employee
            this.employees.push(employee);
        }

        this.saveDataToStorage();
        this.renderEmployees();
        this.updateDashboard();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('employeeModal'));
        modal.hide();
    }

    editEmployee(id) {
        const employee = this.employees.find(emp => emp.id === id);
        if (employee) {
            document.getElementById('employeeId').value = employee.id;
            document.getElementById('employeeName').value = employee.name;
            document.getElementById('employeeEmail').value = employee.email;
            document.getElementById('employeeDepartment').value = employee.department;
            document.getElementById('employeePosition').value = employee.position;
            document.getElementById('employeeStatus').value = employee.status;
            document.getElementById('employeeHireDate').value = employee.hireDate;
            
            document.getElementById('employeeModalTitle').textContent = 'Modifier un Employé';
            
            const modal = new bootstrap.Modal(document.getElementById('employeeModal'));
            modal.show();
        }
    }

    deleteEmployee(id) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cet employé ?')) {
            this.employees = this.employees.filter(emp => emp.id !== id);
            this.saveDataToStorage();
            this.renderEmployees();
            this.updateDashboard();
        }
    }

    viewEmployee(id) {
        const employee = this.employees.find(emp => emp.id === id);
        if (employee) {
            const content = `
                <div class="row">
                    <div class="col-md-6">
                        <h5>Informations Personnelles</h5>
                        <p><strong>Nom:</strong> ${employee.name}</p>
                        <p><strong>Email:</strong> ${employee.email}</p>
                        <p><strong>Poste:</strong> ${employee.position}</p>
                    </div>
                    <div class="col-md-6">
                        <h5>Informations Professionnelles</h5>
                        <p><strong>Département:</strong> ${employee.department}</p>
                        <p><strong>Statut:</strong> <span class="badge bg-${this.getStatusBadgeClass(employee.status)}">${employee.status}</span></p>
                        <p><strong>Date d'embauche:</strong> ${new Date(employee.hireDate).toLocaleDateString('fr-FR')}</p>
                    </div>
                </div>
                <div class="row mt-3">
                    <div class="col-12">
                        <h5>Ancienneté</h5>
                        <p>${this.calculateSeniority(employee.hireDate)}</p>
                    </div>
                </div>
            `;
            
            document.getElementById('employeeDetailContent').innerHTML = content;
            const modal = new bootstrap.Modal(document.getElementById('employeeDetailModal'));
            modal.show();
        }
    }

    calculateSeniority(hireDate) {
        const hire = new Date(hireDate);
        const now = new Date();
        const diffTime = Math.abs(now - hire);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        const years = Math.floor(diffDays / 365);
        const months = Math.floor((diffDays % 365) / 30);
        
        if (years > 0) {
            return `${years} an(s) et ${months} mois`;
        } else {
            return `${months} mois`;
        }
    }

    searchEmployees() {
        this.renderEmployees();
    }

    updateDepartmentFilter() {
        const select = document.getElementById('employeeDepartment');
        const filterSelect = document.getElementById('departmentFilter');
        
        // Update employee form department options
        select.innerHTML = '<option value="">Sélectionner un département</option>';
        this.departments.forEach(dept => {
            select.innerHTML += `<option value="${dept.name}">${dept.name}</option>`;
        });
        
        // Update filter options
        filterSelect.innerHTML = '<option value="">Tous les départements</option>';
        this.departments.forEach(dept => {
            filterSelect.innerHTML += `<option value="${dept.name}">${dept.name}</option>`;
        });
    }

    resetEmployeeForm() {
        document.getElementById('employeeForm').reset();
        document.getElementById('employeeId').value = '';
        document.getElementById('employeeModalTitle').textContent = 'Ajouter un Employé';
    }

    // Department Management
    renderDepartments() {
        const grid = document.getElementById('departmentsGrid');
        grid.innerHTML = '';

        this.departments.forEach(department => {
            const employeeCount = this.employees.filter(emp => emp.department === department.name).length;
            const card = document.createElement('div');
            card.className = 'col-lg-4 col-md-6 mb-4';
            card.innerHTML = `
                <div class="department-card">
                    <div class="d-flex justify-content-between align-items-start mb-3">
                        <h5 class="card-title">${department.name}</h5>
                        <div>
                            <button class="btn btn-sm btn-warning btn-action" onclick="hrPortal.editDepartment(${department.id})">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger btn-action" onclick="hrPortal.deleteDepartment(${department.id})">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <p class="text-muted small">${department.description || 'Aucune description'}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="badge bg-primary">${employeeCount} employé(s)</span>
                        <small class="text-muted">Responsable: ${department.manager || 'Non défini'}</small>
                    </div>
                </div>
            `;
            grid.appendChild(card);
        });
    }

    saveDepartment() {
        const id = document.getElementById('departmentId') ? document.getElementById('departmentId').value : null;
        const department = {
            id: id ? parseInt(id) : Date.now(),
            name: document.getElementById('departmentName').value,
            description: document.getElementById('departmentDescription').value,
            manager: document.getElementById('departmentManager').value
        };

        if (id) {
            // Update existing department
            const index = this.departments.findIndex(dept => dept.id === parseInt(id));
            if (index !== -1) {
                this.departments[index] = department;
            }
        } else {
            // Add new department
            this.departments.push(department);
        }

        this.saveDataToStorage();
        this.renderDepartments();
        this.updateDepartmentFilter();
        this.updateDashboard();
        
        // Close modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('departmentModal'));
        modal.hide();
    }

    editDepartment(id) {
        const department = this.departments.find(dept => dept.id === id);
        if (department) {
            // Create hidden input for department ID if it doesn't exist
            if (!document.getElementById('departmentId')) {
                const idInput = document.createElement('input');
                idInput.type = 'hidden';
                idInput.id = 'departmentId';
                document.getElementById('departmentForm').appendChild(idInput);
            }
            
            document.getElementById('departmentId').value = department.id;
            document.getElementById('departmentName').value = department.name;
            document.getElementById('departmentDescription').value = department.description || '';
            document.getElementById('departmentManager').value = department.manager || '';
            
            document.querySelector('#departmentModal .modal-title').textContent = 'Modifier un Département';
            
            const modal = new bootstrap.Modal(document.getElementById('departmentModal'));
            modal.show();
        }
    }

    deleteDepartment(id) {
        const department = this.departments.find(dept => dept.id === id);
        const employeeCount = this.employees.filter(emp => emp.department === department.name).length;
        
        if (employeeCount > 0) {
            alert(`Impossible de supprimer ce département car il contient ${employeeCount} employé(s).`);
            return;
        }
        
        if (confirm('Êtes-vous sûr de vouloir supprimer ce département ?')) {
            this.departments = this.departments.filter(dept => dept.id !== id);
            this.saveDataToStorage();
            this.renderDepartments();
            this.updateDepartmentFilter();
            this.updateDashboard();
        }
    }

    resetDepartmentForm() {
        document.getElementById('departmentForm').reset();
        const idInput = document.getElementById('departmentId');
        if (idInput) {
            idInput.remove();
        }
        document.querySelector('#departmentModal .modal-title').textContent = 'Ajouter un Département';
    }

    // External API Integration
    loadExternalAPI() {
        const button = event.target;
        button.disabled = true;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Chargement...';

        fetch('https://randomuser.me/api/?results=6&nat=fr')
            .then(response => response.json())
            .then(data => {
                this.apiUsers = data.results;
                this.saveDataToStorage();
                this.renderAPIUsers();
                this.updateKPIs();
                
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-download"></i> Charger API Externe';
            })
            .catch(error => {
                console.error('Error loading API data:', error);
                alert('Erreur lors du chargement des données de l\'API');
                
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-download"></i> Charger API Externe';
            });
    }

    renderAPIUsers() {
        const grid = document.getElementById('apiUsersGrid');
        grid.innerHTML = '';

        this.apiUsers.forEach(user => {
            const col = document.createElement('div');
            col.className = 'col-lg-2 col-md-4 col-sm-6 mb-3';
            col.innerHTML = `
                <div class="api-user-card">
                    <img src="${user.picture.medium}" alt="${user.name.first}" class="api-user-avatar">
                    <h6>${user.name.first} ${user.name.last}</h6>
                    <p class="small text-muted mb-1">${user.email}</p>
                    <p class="small"><strong>${user.location.city}</strong></p>
                </div>
            `;
            grid.appendChild(col);
        });
    }

    // Refresh Dashboard
    refreshDashboard() {
        this.updateDashboard();
        
        // Show success message
        const button = event.target;
        const originalText = button.innerHTML;
        button.innerHTML = '<i class="fas fa-check"></i> Actualisé!';
        button.classList.add('btn-success');
        button.classList.remove('btn-primary');
        
        setTimeout(() => {
            button.innerHTML = originalText;
            button.classList.remove('btn-success');
            button.classList.add('btn-primary');
        }, 2000);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.hrPortal = new HRPortal();
});

// Global functions for onclick handlers
window.refreshDashboard = () => {
    if (window.hrPortal) {
        window.hrPortal.refreshDashboard();
    }
};

window.loadExternalAPI = () => {
    if (window.hrPortal) {
        window.hrPortal.loadExternalAPI();
    }
};
