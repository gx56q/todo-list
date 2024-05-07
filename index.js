function createElement(tag, attributes, children, eventListeners) {
  const element = document.createElement(tag);

  if (attributes) {
    Object.keys(attributes).forEach((key) => {
      element.setAttribute(key, attributes[key]);
    });
  }

  if (eventListeners) {
    Object.keys(eventListeners).forEach((eventName) => {
      element.addEventListener(eventName, eventListeners[eventName]);
    });
  }

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
    const newDomNode = this.render();
    if (this._domNode && this._domNode.parentNode) {
      this._domNode.parentNode.replaceChild(newDomNode, this._domNode);
    }
    this._domNode = newDomNode;
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
      ]
    };
  }

  render() {
    return createElement("div", { class: "todo-list" }, [
      createElement("h1", {}, "TODO List"),
      new AddTask(this.onAddTask).render(),
      createElement("ul", { id: "todos" }, this.state.tasks.map(task => (
          new Task(task, this.onTaskToggle.bind(this), this.onTaskDelete.bind(this)).render()
      )))
    ]);
  }

  onAddTask(newTaskText) {
    const newTask = {
      id: this.state.tasks.length + 1,
      text: newTaskText,
      completed: false
    };
    this.setState({ tasks: [...this.state.tasks, newTask] });
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
    this.update();
  }
}

class Task extends Component {
  constructor(task, onToggle, onDelete) {
    super();
    this.task = task;
    this.onToggle = onToggle;
    this.onDelete = onDelete;
    this.state = {
      deleteClicked: false
    };
  }

  render() {
    const buttonStyle = this.state.deleteClicked ? "color: red;" : "";

    return createElement("li", { class: this.task.completed ? "completed" : "" }, [
      createElement("input", { type: "checkbox", checked: this.task.completed, onchange: this.onToggle.bind(this, this.task.id) }),
      createElement("label", { style: this.task.completed ? "color: grey;" : "" }, this.task.text),
      createElement("button", { onclick: this.onDeleteClick.bind(this), style: buttonStyle }, "🗑️")
    ]);
  }

  onDeleteClick() {
    if (!this.state.deleteClicked) {
      this.setState({ deleteClicked: true });
    } else {
      this.onDelete(this.task.id);
    }
  }
}


class AddTask extends Component {
  constructor(onAddTask) {
    super();
    this.onAddTask = onAddTask;
    this.state = {
      newTaskText: ""
    };
  }

  render() {
    return createElement("div", { class: "add-todo" }, [
      createElement("input", {
        id: "new-todo",
        type: "text",
        placeholder: "Задание",
        oninput: this.onAddInputChange.bind(this)
      }),
      createElement("button", { id: "add-btn", onclick: this.onAdd.bind(this) }, "+"),
    ]);
  }

  onAddInputChange(event) {
    this.setState({ newTaskText: event.target.value });
  }

  onAdd() {
    const newTaskText = this.state.newTaskText.trim();
    if (newTaskText !== "") {
      this.onAddTask(newTaskText);
      this.setState({ newTaskText: "" });
    }
  }
}


document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(new TodoList().getDomNode());
});


