import React, { useEffect, useState } from 'react';

export class SvgBar extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            max: 0
        }
    }
    componentDidUpdate() {
        const { value } = this.props;
        if (value > this.state.max) {
            this.setState({
                max: value
            });
        }
    }
    render() {
        const { label, value, width } = this.props;
        const { max } = this.state;

        return (
            <svg className='chart' width={width} height={30}>
                <g className='bar'>
                    <text x="0" y="0" dy="10">{label}</text>
                    <rect x="9" y="10" height={15} width={value && max > 0 && value > 0 ? value / max * width * 0.98 : 0} ></rect>
                </g>
            </svg>
        )
    }
}