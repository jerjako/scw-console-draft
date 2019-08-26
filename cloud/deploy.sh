#!/bin/bash

set -e

echo "create the vm with playbook"
ansible-playbook cloud/create_vm.yml

echo "waiting vm os to start"
sleep 60

echo "add the server to the known_hosts"
ansible-inventory --list -i cloud/inventory.yml | jq -r '.par1.hosts | .[]' | xargs ssh-keyscan >> ~/.ssh/known_hosts

echo "deploy with the inventory"
ansible-playbook -i cloud/inventory.yml cloud/deploy_on_vm.yml
