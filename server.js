const express = require("express");
const mysql = require("mysql2");

const app = express();


// =====================================
// MIDDLEWARE
// =====================================

app.use(express.json());
app.use(express.static("."));


// =====================================
// CUSTOMER HOME PAGE
// =====================================

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html");
});


// =====================================
// MYSQL CONNECTION
// RAILWAY DATABASE
// =====================================

const db = mysql.createPool({
    host: process.env.MYSQLHOST,
    port: Number(process.env.MYSQLPORT || 3306),
    user: process.env.MYSQLUSER,
    password: process.env.MYSQLPASSWORD,
    database: process.env.MYSQLDATABASE,
    connectionLimit: 10,
    waitForConnections: true,
    queueLimit: 0
});


// =====================================
// DATABASE CONNECTION TEST
// =====================================

db.getConnection((err, connection) => {

    if (err) {

        console.log("Database connection failed");
        console.log(err.message);

    } else {

        console.log("Database connected successfully");

        connection.release();
    }

});


// =====================================
// CUSTOMER BOOKING API
// =====================================

app.post("/book", (req, res) => {

    const {
        name,
        phone,
        email,
        service,
        date,
        time
    } = req.body;


    // Validation

    if (!name || !phone || !service || !date || !time) {

        return res.status(400).json({
            message: "All required fields are necessary."
        });

    }


    // Insert customer

    const customerQuery = `
        INSERT INTO customers
        (name, phone, email)
        VALUES (?, ?, ?)
    `;


    db.query(
        customerQuery,
        [name, phone, email],
        (err, result) => {

            if (err) {

                console.log(
                    "Customer insert error:",
                    err.message
                );

                return res.status(500).json({
                    message: "Unable to save customer."
                });

            }


            const customerId = result.insertId;


            // Insert appointment

            const appointmentQuery = `
                INSERT INTO appointments
                (
                    customer_id,
                    service_id,
                    appointment_date,
                    appointment_time,
                    status
                )
                VALUES (?, ?, ?, ?, 'Pending')
            `;


            db.query(
                appointmentQuery,
                [
                    customerId,
                    service,
                    date,
                    time
                ],
                (err, result) => {

                    if (err) {

                        console.log(
                            "Appointment insert error:",
                            err.message
                        );

                        return res.status(500).json({
                            message:
                                "Unable to book appointment."
                        });

                    }


                    res.status(201).json({

                        message:
                            "Appointment booked successfully!"

                    });

                }
            );

        }
    );

});


// =====================================
// GET ALL APPOINTMENTS
// ADMIN DASHBOARD USES THIS API
// =====================================

app.get("/appointments", (req, res) => {

    const query = `
        SELECT
            a.appointment_id,
            c.name AS customer_name,
            c.phone,
            c.email,
            s.service_name,
            s.price,
            a.appointment_date,
            a.appointment_time,
            a.status

        FROM appointments a

        JOIN customers c
            ON a.customer_id = c.customer_id

        JOIN services s
            ON a.service_id = s.service_id

        ORDER BY a.appointment_id DESC
    `;


    db.query(
        query,
        (err, results) => {

            if (err) {

                console.log(
                    "Appointment fetch error:",
                    err.message
                );

                return res.status(500).json({

                    message:
                        "Unable to fetch appointments."

                });

            }


            res.json(results);

        }
    );

});


// =====================================
// ACCEPT / REJECT APPOINTMENT
// ADMIN DASHBOARD USES THIS API
// =====================================

app.put(
    "/appointments/:id/status",
    (req, res) => {

        const appointmentId =
            req.params.id;

        const { status } = req.body;


        // Only these two statuses are allowed

        if (
            status !== "Accepted" &&
            status !== "Rejected"
        ) {

            return res.status(400).json({

                message:
                    "Invalid status."

            });

        }


        const query = `
            UPDATE appointments

            SET status = ?

            WHERE appointment_id = ?
        `;


        db.query(
            query,
            [
                status,
                appointmentId
            ],
            (err, result) => {

                if (err) {

                    console.log(
                        "Status update error:",
                        err.message
                    );

                    return res.status(500).json({

                        message:
                            "Unable to update appointment status."

                    });

                }


                // Appointment doesn't exist

                if (result.affectedRows === 0) {

                    return res.status(404).json({

                        message:
                            "Appointment not found."

                    });

                }


                res.json({

                    message:
                        `Appointment ${status.toLowerCase()} successfully.`

                });

            }
        );

    }
);


// =====================================
// START SERVER
// =====================================

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {

    console.log(
        `Server running on port ${PORT}`
    );

});