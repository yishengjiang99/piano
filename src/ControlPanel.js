import React from "react";
export const ControlPanel = ({ settings, dispatch }) => (
  <div class="cp" style={{ marginRight: 12 }}>
    <table border={1}>
      <tr>
        <td>Osc3</td>
        <td>1</td>
        <td>2</td>
        <td>3</td>
      </tr>
      <tr>
        <td>Type</td>
        {[0, 1, 2].map((idx) => (
          <td>
            {["sine", "square", "br", "sawtooth", "triangle"].map((option) => {
              // eslint-disable-next-line no-unused-expressions
              if (option == "br") return <br />;
              return (
                <button
                  onClick={() => {
                    dispatch({ idx: idx, key: "osc3", value: option });
                  }}
                >
                  {option}
                </button>
              );
            })}
          </td>
        ))}
      </tr>
      {["overtone", "delay", "detune"].map((attribute) => (
        <tr>
          <td>{attribute}</td>
          {[0, 1, 2].map((idx) => {
            return (
              <td>
                <input
                  type="range"
                  min={0}
                  max={attribute === "overtone" ? 4 : 2}
                  step={0.1}
                  onChange={(e) => {
                    dispatch({ idx: idx, key: attribute, value: e.target.value });
                  }}
                  defaultValue={settings[attribute][idx]}
                ></input>
              </td>
            );
          })}
        </tr>
      ))}
    </table>
  </div>
);

export const ADSR = ({ settings, dispatch }) => {
  const mins = [0.01, 0.01, 0.01, 0.01];
  const max = [2, 2, 0.9, 0.9];
  const attribute = "adsr";
  return (
    <table>
      <thead>
        <th colSpan={2}>envelope</th>
      </thead>
      <tbody>
        {["attack", "decay", "sustain", "release"].map((name, idx) => {
    
          const val = settings[attribute][idx];
          return (
            <tr key={idx}>
              <td>{name}</td>
              <td>
                <input
                  type="range"
                  min={mins[idx]}
                  max={max[idx]}
                  step={0.01}
                  onChange={(e) => {
                    dispatch({ idx: idx, key: attribute, value: parseFloat(e.target.value) });
                  }}
                  defaultValue={settings.adsr[idx]}
                ></input>
              </td>
              <td>{val}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
export const Volumes = ({ settings, dispatch }) => {
  const mins = [-55, 1, 0.01, 0.01]; //ratio=1 is no compression at all
  const max =   [-1, 20, 2, 2];
  const attribute = "compression";
  return (
    <table border={1}>
      <tbody>
        {["threshold", "ratio","preAmp","postAmp"].map((name, idx) => {
  
          const val = settings[attribute][idx];
          return (
            <tr key={idx}>
              <td>{name}</td>
              <td>
                <input
                  type="range"
                  min={mins[idx]}
                  max={max[idx]}
                  step={0.01}
                  onChange={(e) => {
                    dispatch({ idx: idx, key: attribute, value: parseFloat(e.target.value) });
                  }}
                  default={settings.compression[idx]}
                ></input>
              </td>
              <td>{settings.compression[idx]}</td>

            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
