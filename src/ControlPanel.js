import React from "react";
export const ControlPanel = ({ settings, dispatch }) => (
  <div class="cp" style={{ margin: 12 }}>
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
                  value={settings[attribute][idx]}
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
  const attribute = "adsr";
  return (
    <table>
      <thead>
        <th colSpan={2}>envelope</th>
      </thead>
      <tbody>
        {["attack", "decay", "sustain", "release"].map((name, idx) => {
          const mins = [0.01, 0.01, 0.01, 0.01];
          const max = [2, 2, 0.9, 0.9];
          const val = settings[attribute][idx];
          return (
            <tr key={idx}>
              <td>{name}</td>
              <td>
                <input
                  type="range"
                  min={0.01}
                  max={2}
                  step={0.01}
                  onChange={(e) => {
                    dispatch({ idx: idx, key: attribute, value: parseFloat(e.target.value) });
                  }}
                  value={settings.adsr[idx]}
                ></input>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};
