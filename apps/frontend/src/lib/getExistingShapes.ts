import api from "./api";
import { Shape } from "./canvas/draw";

async function getExistingshapes(roomId: string) {
  const response = await api.get(`/shapes/${roomId}`);
  const res = response.data.shape;
  console.log("response: ", response.data)
  const existingShapes: Shape[] = [];
  res[0].shapes.map((items: Shape[]) => {
    existingShapes.push(items[0]);
  });

  const filteredShapes = existingShapes.filter((item) => item !== undefined);

  return filteredShapes;
}

export default getExistingshapes;
