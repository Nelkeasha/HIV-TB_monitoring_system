import { config } from '../config/env';

const FHIR_URL = config.fhir.serverUrl;

// Base function to send requests to FHIR server
const fhirRequest = async (
  method: string,
  path: string,
  body?: object
): Promise<any> => {
  const response = await fetch(`${FHIR_URL}/${path}`, {
    method,
    headers: {
      'Content-Type': 'application/fhir+json',
      'Accept':       'application/fhir+json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`FHIR request failed: ${error}`);
  }

  return response.json();
};

// ─── PATIENT ─────────────────────────────────────────────

// Map your patient to a FHIR Patient resource
export const createFhirPatient = async (patient: {
  id:          string;
  firstName:   string;
  lastName:    string;
  dateOfBirth: Date;
  gender:      string;
  phone?:      string;
  nationalId?: string;
}): Promise<string> => {
  const fhirPatient = {
    resourceType: 'Patient',
    identifier: patient.nationalId
      ? [{ system: 'https://rw.gov/national-id', value: patient.nationalId }]
      : [],
    name: [
      {
        use:    'official',
        family: patient.lastName,
        given:  [patient.firstName],
      },
    ],
    gender:    patient.gender === 'male' ? 'male' : patient.gender === 'female' ? 'female' : 'other',
    birthDate: patient.dateOfBirth.toISOString().split('T')[0],
    telecom: patient.phone
      ? [{ system: 'phone', value: patient.phone, use: 'mobile' }]
      : [],
    meta: {
      tag: [{ system: 'https://hiv-tb-system', code: 'community-patient' }],
    },
  };

  const result = await fhirRequest('POST', 'Patient', fhirPatient);
  return result.id; // Returns the FHIR ID to save in your DB
};

export const getFhirPatient = async (fhirId: string): Promise<any> => {
  return fhirRequest('GET', `Patient/${fhirId}`);
};

// ─── CONDITION ────────────────────────────────────────────

// Map HIV or TB diagnosis to a FHIR Condition resource
export const createFhirCondition = async (data: {
  fhirPatientId: string;
  diseaseType:   string;
  onsetDate?:    Date;
}): Promise<string> => {

  // Standard medical codes for HIV and TB
  const conditionCodes: Record<string, { code: string; display: string }> = {
    HIV:    { code: 'B20',   display: 'Human immunodeficiency virus disease' },
    TB:     { code: 'A15.9', display: 'Respiratory tuberculosis' },
    HIV_TB: { code: 'B20',   display: 'HIV disease with tuberculosis' },
  };

  const coding = conditionCodes[data.diseaseType] || conditionCodes['HIV'];

  const fhirCondition = {
    resourceType:    'Condition',
    clinicalStatus:  {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-clinical', code: 'active' }],
    },
    verificationStatus: {
      coding: [{ system: 'http://terminology.hl7.org/CodeSystem/condition-ver-status', code: 'confirmed' }],
    },
    code: {
      coding: [{ system: 'http://hl7.org/fhir/sid/icd-10', ...coding }],
      text: coding.display,
    },
    subject: {
      reference: `Patient/${data.fhirPatientId}`,
    },
    onsetDateTime: data.onsetDate
      ? data.onsetDate.toISOString()
      : new Date().toISOString(),
  };

  const result = await fhirRequest('POST', 'Condition', fhirCondition);
  return result.id;
};

// ─── OBSERVATION (ADHERENCE) ──────────────────────────────

// Map adherence record to a FHIR Observation resource
export const createFhirAdherenceObservation = async (data: {
  fhirPatientId:      string;
  adherencePercentage: number;
  recordDate:         Date;
  dosesTaken:         number;
  dosesPrescribed:    number;
}): Promise<string> => {

  const fhirObservation = {
    resourceType: 'Observation',
    status:       'final',
    category: [
      {
        coding: [
          {
            system:  'http://terminology.hl7.org/CodeSystem/observation-category',
            code:    'therapy',
            display: 'Therapy',
          },
        ],
      },
    ],
    code: {
      coding: [
        {
          system:  'http://loinc.org',
          code:    '418633004',
          display: 'Medication adherence',
        },
      ],
      text: 'Medication Adherence',
    },
    subject: {
      reference: `Patient/${data.fhirPatientId}`,
    },
    effectiveDateTime: data.recordDate.toISOString(),
    valueQuantity: {
      value:  data.adherencePercentage,
      unit:   '%',
      system: 'http://unitsofmeasure.org',
      code:   '%',
    },
    component: [
      {
        code:         { text: 'Doses Taken' },
        valueInteger: data.dosesTaken,
      },
      {
        code:         { text: 'Doses Prescribed' },
        valueInteger: data.dosesPrescribed,
      },
    ],
  };

  const result = await fhirRequest('POST', 'Observation', fhirObservation);
  return result.id;
};

// ─── MEDICATION DISPENSE ──────────────────────────────────

// Map stock dispensing to a FHIR MedicationDispense resource
export const createFhirMedicationDispense = async (data: {
  fhirPatientId:  string;
  medicationName: string;
  quantity:       number;
  unit:           string;
  dispensedBy:    string;
}): Promise<string> => {

  const fhirDispense = {
    resourceType: 'MedicationDispense',
    status:       'completed',
    medicationCodeableConcept: {
      text: data.medicationName,
    },
    subject: {
      reference: `Patient/${data.fhirPatientId}`,
    },
    performer: [
      {
        actor: { display: data.dispensedBy },
      },
    ],
    quantity: {
      value:  data.quantity,
      unit:   data.unit,
      system: 'http://unitsofmeasure.org',
    },
    whenHandedOver: new Date().toISOString(),
  };

  const result = await fhirRequest('POST', 'MedicationDispense', fhirDispense);
  return result.id;
};

// ─── TASK (HOME VISIT) ────────────────────────────────────

// Map a scheduled visit to a FHIR Task resource
export const createFhirTask = async (data: {
  fhirPatientId: string;
  chwName:       string;
  visitDate:     Date;
  visitType:     string;
  notes?:        string;
}): Promise<string> => {

  const fhirTask = {
    resourceType:    'Task',
    status:          'completed',
    intent:          'order',
    priority:        'routine',
    description:     `${data.visitType.replace('_', ' ')} — ${data.notes || 'No notes'}`,
    for: {
      reference: `Patient/${data.fhirPatientId}`,
    },
    executionPeriod: {
      start: data.visitDate.toISOString(),
      end:   data.visitDate.toISOString(),
    },
    owner: {
      display: data.chwName,
    },
    note: data.notes
      ? [{ text: data.notes }]
      : [],
  };

  const result = await fhirRequest('POST', 'Task', fhirTask);
  return result.id;
};
// Temporary test function — remove after debugging
export const testFhirConnection = async (): Promise<void> => {
  try {
    const response = await fetch(`${FHIR_URL}/metadata`);
    if (response.ok) {
      console.log('✅ FHIR server reachable');
    } else {
      console.error('❌ FHIR server returned:', response.status);
    }
  } catch (error: any) {
    console.error('❌ Cannot reach FHIR server:', error.message);
  }
};