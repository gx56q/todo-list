function createElement(tag, attributes, children, eventListeners) {
  const element = document.createElement(tag);

  // Установка атрибутов
  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      element.setAttribute(key, attributes[key]);
    });
  }

  // Навешивание коллбэков
  if (eventListeners) {
    Object.keys(eventListeners).forEach((eventName) => {
      element.addEventListener(eventName, eventListeners[eventName]);
    });
  }

  // Добавление детей
  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else if (child instanceof HTMLElement) {
        element.appendChild(child);
      }
    });
  } else if (typeof children === "string") {
    element.appendChild(document.createTextNode(children));
  } else if (children instanceof HTMLElement) {
    element.appendChild(children);
  }

  return element;
}

class Component {
  constructor() {
    this._domNode = null; // Дом-узел компонента
  }

  getDomNode() {
    if (!this._domNode) {
      this._domNode = this.render();
    }
    return this._domNode;
  }

  update() {
    const newDomNode = this.render(); // Получаем новое представление компонента
    if (this._domNode && this._domNode.parentNode) {
      this._domNode.parentNode.replaceChild(newDomNode, this._domNode); // Заменяем старую ноду на новую
    }
    this._domNode = newDomNode; // Обновляем ссылку на новую ноду
  }
}

class TodoList extends Component {
  constructor() {
    super();
    this.state = {
      tasks: [
        { id: 1, text: "Сделать домашку", completed: false },
        { id: 2, text: "Сделать практику", completed: false },
        { id: 3, text: "Пойти домой", completed: false }
      ],
      newTaskText: ""
    };
  }

  render() {
    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      createElement("div", { class: "add-todo" }, [
        createElement("input", {
          id: "new-todo",
          type: "text",
          placeholder: "Задание",
          oninput: this.onAddInputChange.bind(this)
        }),
        createElement("button", { id: "add-btn", onclick: this.onAddTask.bind(this) }, "+"),
      ]),
      createElement("ul", { id: "todos" }, this.state.tasks.map(task => (
          createElement("li", { class: task.completed ? "completed" : "" }, [
            createElement("input", { type: "checkbox", checked: task.completed, onchange: this.onTaskToggle.bind(this, task.id) }),
            createElement("label", { style: task.completed ? "color: grey;" : "" }, task.text),
            createElement("button", { onclick: this.onTaskDelete.bind(this, task.id) }, "🗑️")
          ])
      )))
    ]);
  }

  onAddTask() {
    const newTaskText = this.state.newTaskText.trim();
    if (newTaskText !== "") {
      const newTask = {
        id: this.state.tasks.length + 1,
        text: newTaskText,
        completed: false
      };
      this.setState({
        tasks: [...this.state.tasks, newTask],
        newTaskText: ""
      });
    }
  }

  onAddInputChange(event) {
    this.setState({ newTaskText: event.target.value });
  }

  onTaskToggle(taskId) {
    const updatedTasks = this.state.tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, completed: !task.completed };
      }
      return task;
    });
    this.setState({ tasks: updatedTasks });
  }

  onTaskDelete(taskId) {
    const updatedTasks = this.state.tasks.filter(task => task.id !== taskId);
    this.setState({ tasks: updatedTasks });
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.update(); // После обновления состояния вызываем метод update для перерендеринга компонента
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});


