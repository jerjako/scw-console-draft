run_local:
	@docker-compose up -d
	@echo "connect to http://localhost:8080"

stop_local:
	@docker-compose stop && docker-compose rm -f

build_docker:
	@docker build -f cloud/Dockerfile -t ansible-demo:latest .

clean: 
	- @docker run -it -e SCW_TOKEN=${SCW_TOKEN} --volume `pwd`:/project --volume ~/.ssh:/root/.ssh --volume `pwd`/cloud/ansible.cfg:/etc/ansible/ansible.cfg --rm ansible-demo ansible-playbook -i cloud/inventory.yml cloud/delete_vm.yml
	- @docker rmi ansible-demo:latest

deploy_on_scaleway:
	@docker run -it -e SCW_TOKEN=${SCW_TOKEN} --volume `pwd`:/project --volume ~/.ssh:/root/.ssh --volume `pwd`/cloud/ansible.cfg:/etc/ansible/ansible.cfg --rm ansible-demo cloud/deploy.sh

deploy: build_docker deploy_on_scaleway
