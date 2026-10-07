const form = document.getElementById("bookingForm");
const message = document.getElementById("message");

form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const email = document.getElementById("email").value.trim();
    const service = document.getElementById("service").value;
    const date = document.getElementById("date").value;
    const time = document.getElementById("time").value;

    // Frontend validation
    if (!name || !phone || !service || !date || !time) {
        message.innerHTML = `
            <span style="color:red;">
                Please fill all required fields.
            </span>
        `;
        return;
    }

    const bookingData = {
        name,
        phone,
        email,
        service,
        date,
        time
    };

    try {
        const response = await fetch("/book", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(bookingData)
        });

        const result = await response.json();

        if (response.ok) {

            message.innerHTML = `
                <div style="
                    background:#e8f5e9;
                    padding:15px;
                    border-radius:8px;
                    color:#1b5e20;
                    text-align:center;
                ">
                    <h3 style="margin:0 0 8px 0;">
                        ✅ Appointment Booked Successfully!
                    </h3>

                    <p style="margin:5px 0;">
                        Your appointment request has been received.
                    </p>

                    <p style="margin:5px 0;">
                        Please wait for confirmation from the salon.
                    </p>
                </div>
            `;

            // Reset booking form
            form.reset();

        } else {

            message.innerHTML = `
                <span style="color:red;">
                    ${result.message}
                </span>
            `;
        }

    } catch (error) {

        console.log("Booking error:", error);

        message.innerHTML = `
            <span style="color:red;">
                Server is not responding.
            </span>
        `;
    }
});