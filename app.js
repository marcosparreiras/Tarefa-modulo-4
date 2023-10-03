// Model
const model = {
    todos: [
        { id: 23, text: 'tarefa 01', done: false },
        { id: 25, text: 'tarefa 02', done: true },
        { id: 113, text: 'tarefa 03', done: false },
    ],
    addTodo: function (todoObj) {
        this.todos.push(todoObj);
    },
    removeTodo: function (todoId) {
        this.todos = this.todos.filter((todoObj) => {
            return todoObj.id != todoId;
        });
    },
    checkOrUncheckTodo: function (todoId) {
        const todo = this.findTodoById(todoId);
        todo.done = todo.done ? false : true;
    },
    editTodo: function (todoId, text) {
        const todo = this.findTodoById(todoId);
        todo.text = text;
    },
    findTodoById(todoId) {
        return this.todos.find((todoObj) => todoObj.id == todoId);
    },
    getTodos: function () {
        return this.todos;
    },
};

// View
const view = {
    orderBtn: document.getElementById('order-btn'),
    showDoneBtn: document.getElementById('show-done-btn'),
    todoForm: document.getElementById('todo-form'),
    todoInput: document.getElementById('todo-input'),
    editTodoForm: document.getElementById('edit-form'),
    editTodoInput: document.getElementById('edit-input'),
    todoList: document.getElementById('todo-list'),
    renderTodos: function (todosArray) {
        this.clearTodoList();
        if (!this.ShowDoneBtnHasDone()) {
            todosArray = todosArray.filter((todoObj) => !todoObj.done);
        }
        todosArray.forEach((todoObj) => {
            this.createTodo(todoObj.text, todoObj.done, todoObj.id);
        });
    },
    clearTodoList() {
        Array.from(this.todoList.children).forEach((todoLi) => {
            todoLi.remove();
        });
    },
    createTodo: function (todoText, done, todoId) {
        const todoItem = this.createElement(
            'li',
            null,
            done ? 'done' : '',
            todoId
        );
        const spanElement = this.createElement('span', todoText);
        const divElement = this.createElement('div');
        const deleteButton = this.createElement(
            'button',
            'Deletar',
            'delete-btn'
        );
        const editButton = this.createElement('button', 'Editar', 'edit-btn');
        divElement.append(deleteButton, editButton);
        todoItem.append(spanElement, divElement);
        this.todoList.appendChild(todoItem);
        this.todoInput.value = '';
        return todoItem;
    },
    createElement: function (element, innerText, className, id) {
        const HTMLElement = document.createElement(element);
        if (innerText) {
            HTMLElement.innerText = innerText;
        }
        if (className) {
            HTMLElement.classList.add(className);
        }
        if (id) {
            HTMLElement.id = id;
        }
        return HTMLElement;
    },
    showEdit: function (todoLi) {
        this.editTodoForm.style.display = 'flex';
        this.editTodoInput.value = todoLi.querySelector('span').innerText;
    },
    closeEdit: function () {
        this.editTodoForm.style.display = 'none';
        this.editTodoInput.value = '';
    },
    ShowDoneBtnHasDone: function () {
        return this.showDoneBtn.getAttribute('done') ? true : false;
    },
    setShowDoneBtnAttribute: function (attribute, value) {
        if (value === 'true') {
            this.showDoneBtn.classList.add('animated-bg');
        } else {
            this.showDoneBtn.classList.remove('animated-bg');
        }
        this.showDoneBtn.setAttribute(attribute, value);
    },
};

// Controller
const controller = {
    todoInEditionId: null,
    init: function () {
        let todos = model.getTodos();
        let todoCreateId = todos.sort((a, b) => b.id - a.id)[0]?.id || 0;
        view.renderTodos(todos);

        // Btn ordenação ABC...
        view.orderBtn.addEventListener('click', (event) => {
            event.preventDefault();
            // Ordenar to-dos
            todos = model.getTodos().sort((a, b) => {
                if (a.text < b.text) {
                    return -1;
                }
                if (a.text > b.text) {
                    return 1;
                }
                return 0;
            });
            view.renderTodos(todos);
        });

        // Btn mostrar concluidos
        view.showDoneBtn.addEventListener('click', (event) => {
            event.preventDefault();
            // (Mostrar / Ocultar) to-dos concluidos
            todos = model.getTodos();
            view.ShowDoneBtnHasDone()
                ? view.setShowDoneBtnAttribute('done', '')
                : view.setShowDoneBtnAttribute('done', 'true');
            view.renderTodos(todos);
        });

        // Formulário de criação
        view.todoForm.addEventListener('submit', (event) => {
            event.preventDefault();
            const newTodoText = view.todoInput.value;
            // Adicionar to-do
            if (newTodoText.trim() !== '') {
                todoCreateId++;
                model.addTodo({
                    id: todoCreateId,
                    text: newTodoText,
                    done: false,
                });
                todos = model.getTodos();
                view.renderTodos(todos);
            }
        });

        // Formulário de Edição
        view.editTodoForm.addEventListener('click', (event) => {
            event.preventDefault();
            if (event.target.matches('button')) {
                // Concluir edição
                if (event.target.id === 'commit-edit') {
                    model.editTodo(
                        this.todoInEditionId,
                        view.editTodoInput.value
                    );
                    todos = model.getTodos();
                    view.renderTodos(todos);
                }
                // Fechar formulário de edição
                this.todoInEditionId = null;
                view.closeEdit();
            }
        });

        // To-Dos container
        view.todoList.addEventListener('click', (event) => {
            event.preventDefault();
            // (Marcar / Desmarcar) to-do como concluido
            if (event.target.matches('li')) {
                model.checkOrUncheckTodo(event.target.id);
                todos = model.getTodos();
                view.renderTodos(todos);
            }
            if (event.target.matches('button')) {
                const targetButton = event.target;
                const todoCard = targetButton.parentElement.parentElement;
                const buttonClassListArray = Array.from(targetButton.classList);
                // Deletar to-do
                if (buttonClassListArray.includes('delete-btn')) {
                    model.removeTodo(todoCard.id);
                    if (todoCard.id === this.todoInEditionId) {
                        view.closeEdit();
                    }
                    todos = model.getTodos();
                    view.renderTodos(todos);
                }
                // Abrir formulário de edição
                if (buttonClassListArray.includes('edit-btn')) {
                    view.showEdit(todoCard);
                    this.todoInEditionId = todoCard.id;
                }
            }
        });
    },
};

controller.init();
