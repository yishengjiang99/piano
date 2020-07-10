import React from 'react';

class AnimatedCanvas extends React.Component {
    constructor(props) {
      super(props);
      this.state = { data: [] };
      this.updateAnimationState = this.updateAnimationState.bind(this);
    }
    
    componentDidMount() {
      this.rAF = requestAnimationFrame(this.updateAnimationState);
    }
    
    componentWillUnmount() {
      cancelAnimationFrame(this.rAF);
    }
    
    updateAnimationState() {
      var data = this.props.updateCanvasData();
      this.setState({data:data})
      this.rAF = requestAnimationFrame(this.updateAnimationState);
    }
    
    render() {
      return <Canvas data={this.state.data} draw={this.props.draw}/>
    }
  }
  
  class Canvas extends React.Component {
    constructor(props) {
      super(props);
      this.saveContext = this.saveContext.bind(this);

    }
    saveContext(ctx) {
      this.ctx = ctx;
      this.width = this.ctx.canvas.width;
      this.height = this.ctx.canvas.height;
      debugger;
    }
    componentDidUpdate() {
      const {data} = this.props;
     // this.ctx.save();
      this.ctx.beginPath();
      this.ctx.clearRect(0, 0, this.width, this.height);
      this.ctx.fillStyle = '#4397AC';
      let ctx = this.ctx;
      let width = this.width, height = this.height;
      ctx.clearRect(0,0,width,height);

      ctx.fillRect(0, 0, width, height);
      var x = 0;
      var sum =   data.reduce((accumulator, currentValue) => accumulator + currentValue, 0);
      for (let i = 0; i < data.length; i++) {
          const barHeight = data[i];
          const barWidth =  1;
          ctx.fillStyle = 'white';
          ctx.fillRect(x, height-barHeight, barWidth , barHeight);
         // console.log([x, height-barheight, barWidth, barheight], 'drawcan')
         ctx.strokeStyle='white';
         if(i == 3) ctx.strokeText([x, height-barHeight, barWidth , barHeight].join("--"), 30, 30, 330);
          x++;
      }
      ctx.strokeStyle='white'
      ctx.strokeText("sum = "+sum/data.length+ "..... "+data.length, 10,10,400);
     // this.ctx.restore();

    }
    
    render() {
      return <PureCanvas contextRef={this.saveContext} />;

    }
  }
  class PureCanvas extends React.Component {
    shouldComponentUpdate() {
      return false;
    }
  
    render() {
      return (
        <canvas
          width="820"
          height="300"
          ref={node =>
            node ? this.props.contextRef(node.getContext('2d')) : null
          }
        />
      );
    }
  }
  export default AnimatedCanvas