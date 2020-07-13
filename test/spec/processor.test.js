import { useAudioContext, useReverb } from "./processors/index";
import { Envelope } from "./processors/envelope";
import { AudioBus } from "./audioCtx";
import { render, unmountComponentAtNode } from "react-dom";
import { shallow } from "enzyme";
import { act } from "react-dom/test-utils";
let container = null;
beforeEach(() => {
  container = document.createElement("div");
  document.body.appendChild(container);
});
afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});
test("audioBus", function () {
  act(() => {
    render(React.createComponent(AudioBus), container);
  });
  expect(container.textContent).toBe("Hey, stranger");
});
