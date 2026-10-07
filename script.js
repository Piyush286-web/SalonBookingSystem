const bookingForm = document.getElementById("bookingForm");
const message = document.getElementById("message");
const totalPrice = document.getElementById("totalPrice");


// =====================================
// SERVICE SELECTION
// =====================================

const serviceCheckboxes = document.querySelectorAll(
    'input[name="service"]'
);


// =====================================
// CALCULATE TOTAL
// =====================================

function calculateTotal() {

    let total = 0;

    serviceCheckboxes.forEach(service => {

        if (service.checked) {

            total += Number(service.dataset.price);

        }

    });

    totalPrice.textContent = `Total: ₹${total}`;
}


// Add change event to every checkbox

serviceCheckboxes.forEach(service => {

    service.addEventListener(
        "change",
        calculateTotal
    );

});


// =====================================
// BOOK APPOINTMENT
// =====================================

bookingForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const name =
            document.getElementById("name").value.trim();

        const phone =
            document.getElementById("phone").value.trim();

        const email =
            document.getElementById("email").value.trim();

        const date =
            document.getElementById("date").value;

        const time =
            document.getElementById("time").value;


        // Get selected services

        const selectedServices = [];

        serviceCheckboxes.forEach(service => {

            if (service.checked) {

                selectedServices.push(
                    Number(service.value)
                );

            }

        });


        // Validation

        if (
            !name ||
            !phone ||
            selectedServices.length === 0 ||
            !date ||
            !time
        ) {

            message.textContent =
                "Please fill all required fields and select at least one service.";

            message.style.color = "red";

            return;

        }


        try {

            const response = await fetch(
                "/book",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        name: name,

                        phone: phone,

                        email: email,

                        services: selectedServices,

                        date: date,

                        time: time

                    })
                }
            );


            const data =
                await response.json();


            if (response.ok) {

                message.innerHTML = `
                    <div class="success-message">

                        <h3>
                            ✅ Appointment Booked Successfully!
                        </h3>

                        <p>
                            Your appointment request has been received.
                        </p>

                        <p>
                            Please wait for confirmation from the salon.
                        </p>

                    </div>
                `;

                message.style.color = "green";


                // Reset form

                bookingForm.reset();

                totalPrice.textContent =
                    "Total: ₹0";


            } else {

                message.textContent =
                    data.message ||
                    "Unable to book appointment.";

                message.style.color = "red";

            }


        } catch (error) {

            console.log(error);

            message.textContent =
                "Server error. Please try again.";

            message.style.color = "red";

        }

    }
);