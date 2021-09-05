!function() {

    // holds todo items
    let todos = [];

    // some common elements that we mostly use them 
    const form = document.getElementById("todoForm");
    const titleInput = document.getElementById("title");
    const descriptionInput = document.getElementById("description");
    const dateInput = document.getElementById("date");
    const submitBtn = document.getElementById("todoSubmit");
    const helper = document.getElementById("helper");
    const todoItemsContainer = document.getElementById("todoItemsContainer");
    const emptyTodosListHolder = document.getElementById("emptyTodosHolder");

    // anything higher than -1 meaning that we edit existing todo
    let todoId = -1;

    // custom event after form submission and delete todo
    const formSubmittedEvent = new CustomEvent('formSubmitted');
    form.addEventListener("formSubmitted", () => {
        todoId = -1;
        if (!todos.length) {
            emptyTodosListHolder.style.display = 'block';
            helper.style.display = "none";
            clearInputs();
            return;
        }
        helper.style.display = "block";
        emptyTodosListHolder.style.display = 'none';
        clearInputs();
    });

    // handle form submission based on todoId value
    form.addEventListener("submit", (e) => {
        e.preventDefault();
        if (todoId < 0) {
            if (!createTodo({
                title: titleInput.value,
                description: descriptionInput.value,
                dateTime: dateInput.value
            })) {
                alert(validator.getErrorMessage());
                return;
            }
        } else {
            if (!updateTodo({
                title: titleInput.value,
                description: descriptionInput.value,
            })) {
                alert(validator.getErrorMessage());
                return;
            }
        }
        
        form.dispatchEvent(formSubmittedEvent);
    });

    // set current dateTime when we focus on date input
    dateInput.addEventListener("focus", (e) => {
        if (e.target.value === '') {
            const date = new Date();
            e.target.value = `${date.getFullYear()}/${helperTools.fixDateTime(date.getMonth() + 1)}/${helperTools.fixDateTime(date.getDate())} ${helperTools.fixDateTime(date.getHours())}:${helperTools.fixDateTime(date.getMinutes())}:${helperTools.fixDateTime(date.getSeconds())}`;
        }
    })

    // create todo and add element belong to that todo
    const createTodo = ({ title, description, dateTime }) => {
        if (validator.length(title, 120, "title") && validator.length(description, 250, "description") && validator.dateTime(dateTime)) {
            todos.push({
                title,
                description,
                date: dateTime
            });
            newTodoItem(title, description, dateTime);
            return true;
        }
        return false;
    };

    // retrive todo data and fill todo form
    const editTodo = (id) => {
        todoId = parseInt(id);
        submitBtn.innerText = "Edit Todo";
        titleInput.value = todos[id].title;
        descriptionInput.value = todos[id].description;
        dateInput.value = todos[id].date;
        dateInput.disabled = true;
    };

    // update existing todo and update elements
    const updateTodo = ({ title, description }) => {
        if (validator.length(title, 120, "title") && validator.length(description, 250, "description")) {
            todos = todos.map((todo, i) =>{
                if (i === todoId) {
                    return {
                        title,
                        description,
                        date: todo.date
                    }
                }
                return todo;
            });
            const elementToUpdate = document.querySelectorAll('.todo-item')[todoId];
            elementToUpdate.childNodes[0].textContent = title.length > 15 ? `${title.substring(0, 15)}...` : title;
            elementToUpdate.childNodes[1].textContent = description.length > 20 ? `${description.substring(0, 20)}...` : description;
            return true;
        }
        return false;
    };

    // remove todo and elemnt belong to that
    const removeTodo = (element) => {
        if (confirm(`are you sure to delete ?`)) {
            const id = parseInt(element.currentTarget.getAttribute('data-id'));
            todos.splice(id, 1);
            currentTodoNextSiblingsUpdate(element.currentTarget);
            element.currentTarget.removeEventListener('click', todoEventHandlers.clickHandler);
            element.currentTarget.removeEventListener('contextmenu', todoEventHandlers.contextMenuHandler);
            element.currentTarget.remove();
            form.dispatchEvent(formSubmittedEvent);
        }
    };

    // new todo item elements
    const newTodoItem = (title, description, dateTime) => {
        const todoItemContainer = document.createElement('div');
        todoItemContainer.setAttribute('data-id', (todos.length - 1));
        todoItemContainer.classList.add("todo-item");
        const todoTitle = document.createElement('p');
        todoTitle.textContent = title.length > 15 ? `${title.substring(0, 15)}...` : title;
        const todoDescription = document.createElement('p');
        todoDescription.textContent = description.length > 20 ? `${description.substring(0, 20)}...` : description;
        const todoDateTime = document.createElement('p');
        todoDateTime.textContent = dateTime;
        todoItemContainer.appendChild(todoTitle);
        todoItemContainer.appendChild(todoDescription);
        todoItemContainer.appendChild(todoDateTime);
        todoItemsContainer.appendChild(todoItemContainer);
        todoItemContainer.addEventListener('click', todoEventHandlers.clickHandler);
        todoItemContainer.addEventListener('contextmenu', todoEventHandlers.contextMenuHandler);
    };

    // extract next siblings of current todo , then we update data-id attribute for each of them based on todo index key changes
    const currentTodoNextSiblingsUpdate = (element) => {
        let nextSibling = element.nextElementSibling;

        while(nextSibling) {
            nextSibling.setAttribute('data-id', parseInt(nextSibling.getAttribute('data-id')) - 1);
            nextSibling = nextSibling.nextElementSibling;
        }
    }

    // reset form fields value
    const clearInputs = () => {
        titleInput.value = '';
        descriptionInput.value = '';
        dateInput.value = '';
        submitBtn.innerHTML = 'Add Todo';
        dateInput.disabled = false;
    };

    // we use this object for delete event listeners after deleting a todo, preventing memory leak ! :D
    const todoEventHandlers = (function() {
        return {
            clickHandler: (e) => {
                if (e.ctrlKey) {
                    e.currentTarget.classList.toggle("completed");
                    return;
                }
                editTodo(e.currentTarget.getAttribute('data-id'));
            },
            contextMenuHandler: (e) => {
                e.preventDefault();
                removeTodo(e);
            }
        }
    })();

    // validator module for validation input fields
    const validator = (function() {

        let errorMessage;

        const length = (value, length, field) => {
            if (value && value.length && value.length <= length) {
                return true;
            }
            errorMessage = `${field} can't be empty or more than ${length} charachters.`;
            return false;
        }

        const dateTime = (date) => {
            if (date && date.match(/^(?:\d{4})\/(?:\d{2})\/(?:\d{2}) (?:\d{2})\:(?:\d{2})\:(?:\d{2})$/)) {
                return true;
            }
            errorMessage = `Please enter date in the correct format: yyyy/mm/dd hh:mm:ss`;
            return false;
        }

        const getErrorMessage = () => errorMessage;

        return {
            length,
            dateTime,
            getErrorMessage
        }

    })();

    const helperTools = (function() {
        return {
            fixDateTime: (value) => {
                return value > 0 && value < 10 ? "0" + value : value;
            }
        }
    })();
}();