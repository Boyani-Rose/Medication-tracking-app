document.addEventListener ('DOMContentLoaded', function (){
    
getMedications()



})
let medications = []

const medicationName = document.querySelector('#medication-name').value
const pillCount = document.querySelector('#pill-count').value
const pillsPerDose = document.querySelector('#pill-per-dose').value
const frequency = document.querySelector('#autoSizingSelect').value

if (!medicationName || !pillCount || !pillsPerDose || !frequency) {
    alert("Please fill in all fields.") 
    return; 
}

const newMedication = {
    id: Date.now(), // Unique ID
    name: medicationName,
    totalPills: Number(pillCount),
    pillsPerDose: Number(pillsPerDose),
    frequency: Number(frequency),
    dosesTaken: 0
}

medications.push (newMedication)

addMedicationToList(newMedication)

event.target.reset()
document.querySelector('#form').addEventListener ('submit', function (event){
    event.preventDefault()
    if (event.target.classList.contains('form-control')){
        const addedMedication = medications.find((med)=> med.id === event.target.id)
        addMedicationToList(addedMedication)
    }
})



function getMedications () {
    return fetch('http://localhost:3000/medications',{
        method : 'GET',
        headers : {
            'Accept' : 'application/json'
        }

    }) .then((response)=>response.json())
    .then ((data)=>{
        medications = data
    })
}

function addMedicationToList () {
    fetch ('http://localhost:3000/medications', {
        method : 'POST',
        headers :{
            'Accept' : 'application/json',
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify (newMedication)
            
    }).then((response) => response.json())
    .then((data) => console.log ('Medication added', data))
}

function displayMedication (medications = []) {
    const listOfMedications = document.querySelector('tbody#medication-list')
    medications.forEach((medication, index)=> {
    listOfMedications.innerHTML += `
     <tr>
                    <th scope="row">${medication.id}</th>
                    <td>${medication.name}</td>
                    <td>${medication.frequency}</td>
                    <td>${medication.timeToTake}</td>
                    <td>${medication.remainingDoses}</td>
                    <td>${medication.status}</td>
                    <td><button>Taken</button></td>
                    <td>Fatigue</td>

                  </tr>
    `
})
}