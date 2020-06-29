import EnvelopConfig from "./envelop-config";
import Head from "next/head";
import { useState, useRef, useEffect } from "react";

export default function bach(props) {
  const [settings, setSettings] = useState({
    envelope: {
      attack: 0.1,
      decay: 0.1,
      sustain: 0.1,
      release: 0.1, //0.01
    },
    volume: {
      min: 0,
      max: 6,
    },
  });
  const pianoRef = useRef();
  useEffect(() => {
    pianoRef.current;
    debugger;
    return;
  }, []);

  function updateAttribute(attribute, value) {
    setSettings({
      ...settings,
      attribute: value,
    });
  }
  return (
    <>
      <Head>
        <script type="module" src="/keyboard/piano.js"></script>
      </Head>
      <details>
        <summary>AM ADSR</summary>
        <EnvelopConfig
          style={{ maxWidth: "200px" }}
          defaults={settings.envelope}
          onInput={updateAttribute}
        ></EnvelopConfig>
      </details>
      <piano-keyboard
        ref={pianoRef}
        onNote={props.onNote}
        attack={settings.envelope.attack}
        release={settings.envelope.release}
        decay={settings.envelope.decay}
        sustain={settings.envelope.sustain}
      ></piano-keyboard>
      <details>
        <summary>Console</summary>
        <div id="console"></div>
      </details>
    </>
  );
}
