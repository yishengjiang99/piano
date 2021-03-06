import React from "react";
import "./Window.css";

function debug(msg) {
  //   document.getElementById("debug").innerHTML+="<br>"+msg;
}

class Window extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      minimized: true,
      maximized: true,
      closed: false,
      isResizing: false,
      isDragging: false,
      top: props.top || 0,
      left: props.left || 0,
      width: props.width || 800,
      height: props.height || 300,
      lastMouseX: 0,
      lastMouseY: 0,
    };
  }
  onNavBarClick = (e) => {
    const mode = e.target.className;
    if (mode === "maximize") {
      this.setState((prev) => ({
        maximized: !prev.maximized,
      }));
    } else if (mode === "minimize") {
      this.setState((prev) => ({
        minimized: !prev.minimized,
      }));
    } else if (mode === "closee") {
      this.setState({ closed: true });
      this.props.ipc("close", [this.props.pid]);
    }
  };
  renderNavTop = () => {
    return (
      <div className="title" onMouseDown={this.onNavbarMouseDown}>
        <button className="closee" onClick={this.onNavBarClick}>
          x
        </button>
        <button className="maximize" onClick={this.onNavBarClick}>
          []
        </button>
        <button className="minimize" onClick={this.onNavBarClick}>
          _
        </button>
        <p className="title">{this.props.title}</p>
      </div>
    );
  };

  onNavbarMouseDown = (e) => {
    window.addEventListener("mousemove", this.onNavbarMouseMove);
    window.addEventListener("mouseup", this.onNavbarMouseUp);
    var mouseX = e.clientX;
    var mouseY = e.clientY;
    this.setState({
      lastMouseX: mouseX,
      lastMouseY: mouseY,
      isDragging: true,
    });
  };
  onNavbarMouseUp = (e) => {
    window.removeEventListener("mouseup", this.onNavbarMouseUp);
    window.removeEventListener("mousemove", this.onNavbarMouseMove);
  };
  onNavbarMouseMove = (e) => {
    var mouseX = e.clientX;
    var mouseY = e.clientY;
    if (this.state.dragging === false) return;

    const deltaX = mouseX - this.state.lastMouseX;
    const deltaY = mouseY - this.state.lastMouseY;
    this.setState({
      left: this.state.left + deltaX,
      top: this.state.top + deltaY,
      lastMouseX: mouseX,
      lastMouseY: mouseY,
      maximized: false,
      minimized: false,
    });
  };
  onCornerMouseDown = (e) => {
    window.addEventListener("mousemove", this.onCornerMouseMove);
    window.addEventListener("mouseup", this.onCornerMouseUp);
    var mouseX = e.clientX;
    var mouseY = e.clientY;
    debug("mouse down");
    this.setState({
      lastMouseX: mouseX,
      lastMouseY: mouseY,
      maximized: false,
      minimized: false,
      isResizing: true,
    });
  };
  onCornerMouseUp = (e) => {
    this.setState({ isResizing: false, lastMouseX: 0, lastMouseY: 0 });
    window.removeEventListener("mouseup", this.onCornerMouseUp);
    window.removeEventListener("mousemove", this.onCornerMouseUp);
  };

  onCornerMouseMove = (e) => {
    var mouseX = e.clientX;
    var mouseY = e.clientY;
    if (this.state.isResizing === false) {
      return;
    }
    debug("mouse move " + mouseX + " " + mouseY);

    const deltaX = mouseX - this.state.lastMouseX;
    const deltaY = mouseY - this.state.lastMouseY;
    this.setState({
      width: this.state.width + deltaX,
      height: this.state.height + deltaY,
      lastMouseX: mouseX,
      lastMouseY: mouseY,
    });
  };
  renderFooter = () => {
    return (
      <div className="footer" onMouseDown={this.onCornerMouseDown}>
        <span>{this.props.windowInfo}</span>
        <span className="corner" style={{ float: "right" }}></span>
      </div>
    );
  };
  componentDidMount() {
    window.removeEventListener("resize", function () {
      this.setState({
        top: window.height - this.state.height,
        left: window.innerWidth - this.state.width,
      });
    });
  }
  render() {
    if (this.state.closed) return null;
    var boxClass = "box";
    if (this.props.className) boxClass = this.props.className + " " + boxClass;

    const sizeStyle = {
      top: this.state.maximized ? 0 : this.state.top,
      left: this.state.maximized ? 0 : this.state.left,
      width: this.state.maximized ? "100%" : this.state.width,
      cursor: this.state.isResizing ? "se-resize" : "cursor",
      height: this.state.minimized ? 18 : this.state.maximized ? "100%" : this.state.height,
      zIndex: 10,
    };

    const corderStyle = {
      cursor: "se-resize",
      float: "right",
    };

    return (
      <div className={boxClass} style={sizeStyle}>
        {this.renderNavTop()}
        <div className="body">{this.props.children}</div>
        <div className="footer" onMouseDown={this.onCornerMouseDown}>
          <span>{this.props.windowInfo}</span>
          <span className="corner" style={corderStyle}></span>
        </div>
      </div>
    );
  }
}

export default Window;
