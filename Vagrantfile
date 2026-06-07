Vagrant.configure("2") do |config|
  config.vm.box = "ubuntu/jammy64"
  config.vm.hostname = "docker-server"
  
  config.vm.network "private_network", ip: "192.168.56.10"
  config.vm.network "forwarded_port", guest: 3000, host: 3000  # Frontend
  config.vm.network "forwarded_port", guest: 8000, host: 8000  # Backend
  config.vm.network "forwarded_port", guest: 8001, host: 8001  # AI Service
  config.vm.network "forwarded_port", guest: 5432, host: 5432  # PostgreSQL
  config.vm.network "forwarded_port", guest: 6379, host: 6379  # Redis

  config.vm.provider "virtualbox" do |vb|
    vb.memory = 4096
    vb.cpus = 2
  end

  config.vm.provision "shell", inline: <<-SHELL
    apt-get update
    apt-get install -y docker.io docker-compose git
    usermod -aG docker vagrant
  SHELL
end
