document.addEventListener ('DOMContentLoaded', function (){
    
getMedications()

document.querySelector('#form').addEventListener ('click', function (event){
    event.preventDefault()
    if (event.target.classList.contains('form-control')){
        const addedMedication = medications.find((med)=> med.id === event.target.id)
        addMedicationToList(addedMedication)
    }
})

})
let medications = []



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
        body : JSON.stringify ({

        })
    }).then((response) => response.json())
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