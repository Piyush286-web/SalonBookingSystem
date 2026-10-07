const bookingForm = document.getElementById("bookingForm");
const message = document.getElementById("message");
const totalPrice = document.getElementById("totalPrice");


// =====================================
// CALCULATE TOTAL
// =====================================

function calculateTotal() {

    const selectedServices =
        document.querySelectorAll(
            'input[name="service"]:checked'
        );

    let total = 0;

    selectedServices.forEach(service => {
        total += Number(service.dataset.price);
    });

    totalPrice.textContent = `Total: ₹${total}`;
}


// Add change event

document
    .querySelectorAll('input[name="service"]')
    .forEach(service => {

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


        // Get selected services AGAIN
        // at the time of booking

        const checkedServices =
            document.querySelectorAll(
                'input[name="service"]:checked'
            );


        const selectedServices = [];

        checkedServices.forEach(service => {

            selectedServices.push(
                Number(service.value)
            );

        });


        console.log("Name:", name);
        console.log("Phone:", phone);
        console.log("Email:", email);
        console.log("Services:", selectedServices);
        console.log("Date:", date);
        console.log("Time:", time);


        // =====================================
        // VALIDATION
        // =====================================

        if (name === "") {

            message.textContent =
                "Please enter your name.";

            message.style.color = "red";

            return;
        }


        if (phone === "") {

            message.textContent =
                "Please enter your phone number.";

            message.style.color = "red";

            return;
        }


        if (selectedServices.length === 0) {

            message.textContent =
                "Please select at least one service.";

            message.style.color = "red";

            return;
        }


        if (date === "") {

            message.textContent =
                "Please select appointment date.";

            message.style.color = "red";

            return;
        }


        if (time === "") {

            message.textContent =
                "Please select appointment time.";

            message.style.color = "red";

            return;
        }


        // =====================================
        // SEND TO SERVER
        // =====================================

        try {

            const response =
                await fetch(
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

                            services:
                                selectedServices,

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