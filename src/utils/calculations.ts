import { FormData, FieldData, Results, Reading } from '../types/soilAnalysis';

interface StandardDeviation {
  mean: number;
  deviation: number;
}

const calculateStandardDeviation = (values: number[]): StandardDeviation => {
  if (!values || values.length === 0) return { mean: 0, deviation: 0 };
  
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - mean, 2));
  const variance = squareDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  
  return {
    mean,
    deviation: Math.sqrt(variance)
  };
};

export const calculateResults = (
  formData: FormData, 
  fieldData: FieldData
): { results: Results; warnings: string[] } => {
  const warnings: string[] = [];
  
  // Ensure readings array exists and is valid
  if (!fieldData?.readings || !Array.isArray(fieldData.readings)) {
    warnings.push("No valid readings data found");
    return {
      results: {
        bacteria: { perGram: 0, micrograms: 0, standardDeviation: 0 },
        actinobacteria: { length: 0, micrograms: 0, standardDeviation: 0 },
        fungi: { length: 0, micrograms: 0, standardDeviation: 0 },
        oomycetes: { length: 0, micrograms: 0, standardDeviation: 0 },
        flagellate: 0,
        flagellateStdDev: 0,
        amoebae: 0,
        amoebaeStdDev: 0,
        ciliates: 0,
        ciliatesStdDev: 0,
        nematodes: 0,
        nematodesBacterial: 0,
        nematodesFungal: 0,
        nematodesPredator: 0,
        nematodesRoot: 0,
        fbRatio: 0,
        fbRatioStdDev: 0
      },
      warnings
    };
  }
  
  // Calculate means and standard deviations for each reading
  const readingStats = fieldData.readings.map(reading => {
    // Ensure fieldsOfView exists and is valid
    if (!reading?.fieldsOfView || !Array.isArray(reading.fieldsOfView)) {
      return [];
    }

    return reading.fieldsOfView.map(fov => {
      // Ensure all arrays exist before mapping
      const actinobacteriaValues = (fov.actinobacteria || [])
        .map(m => Number(m?.length) || 0);
      const fungiValues = (fov.fungi || [])
        .map(m => (Number(m?.length) || 0) * (Number(m?.diameter) || 0));
      const oomycetesValues = (fov.oomycetes || [])
        .map(m => (Number(m?.length) || 0) * (Number(m?.diameter) || 0));
      
      return {
        actinobacteria: calculateStandardDeviation(actinobacteriaValues),
        fungi: calculateStandardDeviation(fungiValues),
        oomycetes: calculateStandardDeviation(oomycetesValues),
        flagellate: Number(fov?.flagellate) || 0,
        amoebae: Number(fov?.amoebae) || 0,
        ciliates: Number(fov?.ciliates) || 0,
      };
    });
  }).flat();

  // Ensure bacterial array exists and is valid
  const bacterialValues = (fieldData.bacterial || [])
    .filter(val => val !== "" && !isNaN(Number(val)))
    .map(Number);
  
  const stats = {
    bacterial: calculateStandardDeviation(bacterialValues),
    actinobacteria: calculateStandardDeviation(readingStats.map(fov => fov?.actinobacteria?.mean || 0)),
    fungi: calculateStandardDeviation(readingStats.map(fov => fov?.fungi?.mean || 0)),
    oomycetes: calculateStandardDeviation(readingStats.map(fov => fov?.oomycetes?.mean || 0)),
    flagellate: calculateStandardDeviation(readingStats.map(fov => fov?.flagellate || 0)),
    amoebae: calculateStandardDeviation(readingStats.map(fov => fov?.amoebae || 0)),
    ciliates: calculateStandardDeviation(readingStats.map(fov => fov?.ciliates || 0)),
    nematodesBacterial: Number(fieldData?.nematodesBacterial) || 0,
    nematodesFungal: Number(fieldData?.nematodesFungal) || 0,
    nematodesPredator: Number(fieldData?.nematodesPredator) || 0,
    nematodesRoot: Number(fieldData?.nematodesRoot) || 0,
  };

  const { dilution = 0, bacterialDilution = 0, dropsPerMl = 0, coverslipFields = 0 } = formData || {};
  const biomassPerBacterium = 2 / 1e6; // 2 picograms to micrograms
  const actinobacteriaBiomassPerCm3 = 0.23 * 1e6; // 0.23 g/cm³ to µg/cm³
  const fungiOomycetesBiomassPerCm3 = 1.5 * 1e6; // 1.5 g/cm³ to µg/cm³

  const bacteriaPerGram = stats.bacterial.mean * bacterialDilution * coverslipFields * dropsPerMl;
  const bacteriaMicrograms = bacteriaPerGram * biomassPerBacterium;
  const bacteriaStdDev = stats.bacterial.deviation * bacterialDilution * coverslipFields * dropsPerMl * biomassPerBacterium;

  const actinobacteriaLength = stats.actinobacteria.mean * dilution * coverslipFields * dropsPerMl;
  const actinobacteriaMicrograms = actinobacteriaLength * actinobacteriaBiomassPerCm3;
  const actinobacteriaStdDev = stats.actinobacteria.deviation * dilution * coverslipFields * dropsPerMl * actinobacteriaBiomassPerCm3;

  const fungiLength = stats.fungi.mean * dilution * coverslipFields * dropsPerMl;
  const fungiMicrograms = fungiLength * fungiOomycetesBiomassPerCm3;
  const fungiStdDev = stats.fungi.deviation * dilution * coverslipFields * dropsPerMl * fungiOomycetesBiomassPerCm3;

  const oomycetesLength = stats.oomycetes.mean * dilution * coverslipFields * dropsPerMl;
  const oomycetesMicrograms = oomycetesLength * fungiOomycetesBiomassPerCm3;
  const oomycetesStdDev = stats.oomycetes.deviation * dilution * coverslipFields * dropsPerMl * fungiOomycetesBiomassPerCm3;

  const flagellatePerMl = stats.flagellate.mean * dilution * coverslipFields * dropsPerMl;
  const flagellateStdDev = stats.flagellate.deviation * dilution * coverslipFields * dropsPerMl;
  
  const amoebaePerMl = stats.amoebae.mean * dilution * coverslipFields * dropsPerMl;
  const amoebaeStdDev = stats.amoebae.deviation * dilution * coverslipFields * dropsPerMl;
  
  const ciliatesPerMl = stats.ciliates.mean * dilution * coverslipFields * dropsPerMl;
  const ciliatesStdDev = stats.ciliates.deviation * dilution * coverslipFields * dropsPerMl;

  const nematodesBacterialPerMl = stats.nematodesBacterial * dilution * dropsPerMl;
  const nematodesFungalPerMl = stats.nematodesFungal * dilution * dropsPerMl;
  const nematodesPredatorPerMl = stats.nematodesPredator * dilution * dropsPerMl;
  const nematodesRootPerMl = stats.nematodesRoot * dilution * dropsPerMl;
  const nematodesPerMl =
    nematodesBacterialPerMl + nematodesFungalPerMl + nematodesPredatorPerMl + nematodesRootPerMl;

  const fbRatio = bacteriaMicrograms ? fungiMicrograms / bacteriaMicrograms : 0;
  const fbRatioStdDev = bacteriaMicrograms ? 
    Math.abs(fbRatio) * Math.sqrt(
      Math.pow(fungiStdDev / fungiMicrograms, 2) + 
      Math.pow(bacteriaStdDev / bacteriaMicrograms, 2)
    ) : 0;

  return {
    results: {
      bacteria: { 
        perGram: bacteriaPerGram, 
        micrograms: bacteriaMicrograms,
        standardDeviation: bacteriaStdDev 
      },
      actinobacteria: { 
        length: actinobacteriaLength, 
        micrograms: actinobacteriaMicrograms,
        standardDeviation: actinobacteriaStdDev 
      },
      fungi: { 
        length: fungiLength, 
        micrograms: fungiMicrograms,
        standardDeviation: fungiStdDev 
      },
      oomycetes: { 
        length: oomycetesLength, 
        micrograms: oomycetesMicrograms,
        standardDeviation: oomycetesStdDev 
      },
      flagellate: flagellatePerMl,
      flagellateStdDev,
      amoebae: amoebaePerMl,
      amoebaeStdDev,
      ciliates: ciliatesPerMl,
      ciliatesStdDev,
      nematodes: nematodesPerMl,
      nematodesBacterial: nematodesBacterialPerMl,
      nematodesFungal: nematodesFungalPerMl,
      nematodesPredator: nematodesPredatorPerMl,
      nematodesRoot: nematodesRootPerMl,
      fbRatio,
      fbRatioStdDev
    },
    warnings,
  };
};