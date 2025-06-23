import { FormData, FieldData } from '../types/soilAnalysis';

export const initialFormData: FormData = {
  client: "",
  organization: "",
  dateCollected: "",
  dateObserved: "",
  sample: "",
  observer: "",
  plantType: "vegetables",
  dilution: 5,
  bacterialDilution: 1000,
  dropsPerMl: 20,
  coverslipFields: 2038,
};

const createEmptyFieldOfView = () => ({
  actinobacteria: [],
  fungi: [],
  oomycetes: [],
  flagellate: "",
  amoebae: "",
  ciliates: "",
});

export const initialFieldData: FieldData = {
  readings: [
    {
      id: "reading-1",
      name: "Reading 1",
      fieldsOfView: [createEmptyFieldOfView()]
    }
  ],
  bacterial: Array(20).fill(""),
  nematodesBacterial: "",
  nematodesFungal: "",
  nematodesPredator: "",
  nematodesRoot: "",
};