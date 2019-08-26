# Console-draft for the EA of Domains

this is an example of a console done with the Scaleway Domains API

after deploying the project, you will need to log with your scaleway API token (store locally) to use this front access

with this example, you can :

* order one Free Domain
* manage the DNS records

## to start locally the server on http://localhost:8080:
`make run_local`

## to stop locally the server on http://localhost:8080:
`make stop_local`

## to deploy on a Scaleway Instance

you will need to provide your token in environment variable `SCW_TOKEN`

with `make deploy`, it will build a Docker Ansible image to create and deploy the project on a VM

with `make clean`, it will delete the VM and delete the Docker image