async function* counterGenerator(delay) {
  let counter = 0;
  while (true) {
    await new Promise(r => setTimeout(r, delay));
    counter += 1;
    console.log('reading:', counter);
    yield counter;

  }
}
const counterIterator = counterGenerator(1000);


const logIterator = async (iterator) => {
  for await (const item of iterator) {
    console.log('writing:', item);
  }
};

logIterator(counterIterator);
