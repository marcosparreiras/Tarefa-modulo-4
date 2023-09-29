// Model
const model = {
    todos: [
        { id: 23, text: 'tarefa 01', done: false },
        { id: 25, text: 'tarefa 02', done: true },
        { id: 113, text: 'tarefa 03', done: false },
    ], //local storage, db
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
    logTodos: function () {
        console.log(this.todos);
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
        todosArray.forEach((todoObj) => {
            this.createTodo(todoObj.text, todoObj.done, todoObj.id);
        });
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
    removeTodo: function (todoLi) {
        todoLi.remove();
    },
    showEdit: function (todoLi) {
        this.editTodoForm.style.display = 'flex';
        this.editTodoInput.value = todoLi.querySelector('span').innerText;
    },
    closeEdit: function () {
        this.editTodoForm.style.display = 'none';
        this.editTodoInput.value = '';
    },
    checkOrUncheckTodo: function (todoLi) {
        todoLi.classList.toggle('done');
    },
    editTodo: function (todoLi) {
        const spanElement = todoLi.querySelector('span');
        spanElement.innerText = this.editTodoInput.value;
        this.closeEdit();
        return spanElement.innerText;
    },
    clearTodoList() {
        Array.from(this.todoList.children).forEach((todoLi) => {
            todoLi.remove();
        });
    },
    setShowDoneBtnHasDone: function () {
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

        // Ordenar todos
        view.orderBtn.addEventListener('click', (event) => {
            event.preventDefault();
            view.clearTodoList();
            todos = model.getTodos().sort((a, b) => {
                if (a.text < b.text) {
                    return -1;
                }
                if (a.text > b.text) {
                    return 1;
                }
                return 0;
            });
            if (!view.setShowDoneBtnHasDone()) {
                todos = todos.filter((todoObj) => !todoObj.done);
            }
            view.renderTodos(todos);
        });

        // (Mostrar / Ocultar) todos concluidos
        view.showDoneBtn.addEventListener('click', (event) => {
            event.preventDefault();
            view.clearTodoList();
            todos = model.getTodos();
            if (view.setShowDoneBtnHasDone()) {
                todos = todos.filter((todoObj) => !todoObj.done);
                view.setShowDoneBtnAttribute('done', '');
            } else {
                view.setShowDoneBtnAttribute('done', 'true');
            }
            view.renderTodos(todos);
        });

        // Painel de criação
        view.todoForm.addEventListener('submit', function (event) {
            event.preventDefault();
            const todoText = view.todoInput.value;

            // Adicionar todo
            if (todoText.trim() !== '') {
                todoCreateId++;
                const todoCard = view.createTodo(todoText, false, todoCreateId);
                model.addTodo({ id: todoCard.id, text: todoText, done: false });
            }
        });

        // Painel de Edição
        view.editTodoForm.addEventListener('click', (e) => {
            e.preventDefault();
            const todoCard = document.getElementById(this.todoInEditionId);
            if (e.target.matches('button')) {
                const buttonTarget = e.target;

                // Fechar edição
                if (buttonTarget.id === 'close-edit') {
                    view.closeEdit();
                    this.todoInEditionId = null;
                }

                // Concluir edição
                if (buttonTarget.id === 'commit-edit') {
                    const newText = view.editTodo(todoCard);
                    model.editTodo(this.todoInEditionId, newText);
                    this.todoInEditionId = null;
                }
            }
        });

        // Todo container
        view.todoList.addEventListener('click', (e) => {
            e.preventDefault();
            // (Marca / Desmarca) todo como concluido
            if (e.target.matches('li')) {
                const todoCard = e.target;
                view.checkOrUncheckTodo(todoCard);
                model.checkOrUncheckTodo(todoCard.id);
                view.clearTodoList();
                todos = model.getTodos();
                if (!view.setShowDoneBtnHasDone()) {
                    todos = todos.filter((todoObj) => !todoObj.done);
                }
                view.renderTodos(todos);
            }

            if (e.target.matches('button')) {
                const targetButton = e.target;
                const todoCard = targetButton.parentElement.parentElement;
                const buttonClassListArray = Array.from(targetButton.classList);

                // Deletar todo
                if (buttonClassListArray.includes('delete-btn')) {
                    view.removeTodo(todoCard);
                    model.removeTodo(todoCard.id);
                }

                // Abrir painel de edição
                if (buttonClassListArray.includes('edit-btn')) {
                    view.showEdit(todoCard);
                    this.todoInEditionId = todoCard.id;
                }
            }
        });
    },
};

controller.init();
