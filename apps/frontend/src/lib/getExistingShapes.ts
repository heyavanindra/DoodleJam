import api from "./api";

async function getExistingshapes(roomId:string) {
  const response = await api.get(`/shapes/${roomId}`);
  const res = response.data.shapes;

  const shapes = res.map(
    (data: {
      id: string;
      type: string;
      shapetype: string;
      data: {
        x: number;
        y: number;
        width: number;
        height: number;
      };
    }) => {
      return data.data;
    },
  );
  return shapes;
}

export default getExistingshapes;