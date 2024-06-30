variable "aws_access_key" {
  type = string
  description = "The AWS Access key"
}

variable "aws_secret_key" {
  type = string
  description = "The AWS secret key"
}


provider "aws" {
  region     = "ap-south-1"
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}



# Create VPC with private and public subnet. 
# To create VPC 
resource "aws_vpc" "custom_vpc_tf" {
  cidr_block = "192.168.0.0/16"
  enable_dns_support = true
  enable_dns_hostnames = true
  tags = {
    Name = "custom_vpc_tf"
  }
}
# create 2 subnet private and public and  
resource "aws_subnet" "public_subnet" {
  vpc_id     = aws_vpc.custom_vpc_tf.id
  cidr_block = "192.168.1.0/24"
  availability_zone = "ap-south-1a"

  tags = {
    Name = "public-subnet"
  }
}




# To create two route table. private and public route table( it is association subnet and outter network. route table is interface between subnet and outter network(may be instance NAT other gatways.))
resource "aws_route_table" "public_route_table" {
  vpc_id = aws_vpc.custom_vpc_tf.id

  # since this is exactly the route AWS will create, the route will be adopted
  # it is by defaul take cidr_block from vpc_id and gatewat set 
#   route {
#     cidr_block = "192.168.0.0/16"
#     gateway_id = "local"
#   }
  tags = {
    Name = "public-route table"
  }
}


# route table is association with subnet and route table.
resource "aws_route_table_association" "public_route_public_subnet" {
  subnet_id      = aws_subnet.public_subnet.id
  route_table_id = aws_route_table.public_route_table.id
}



resource "aws_internet_gateway" "gw" {
  vpc_id = aws_vpc.custom_vpc_tf.id

  tags = {
    Name = "custom-internet-gw-tf"
  }
}



# Attach the internet gateway to the route table
resource "aws_route" "route_association_internet_gateway" {
  route_table_id         = aws_route_table.public_route_table.id
  destination_cidr_block = "0.0.0.0/0"  # Route all traffic to the internet gateway
  gateway_id             = aws_internet_gateway.gw.id
}





# Generate a new RSA key pair
resource "tls_private_key" "key_pair_public_private" {
  algorithm = "RSA"
  rsa_bits  = 2048
}

# Use the generated public key to create an AWS key pair
resource "aws_key_pair" "key_pair_tf" {
  key_name   = "key-pair-blog-tf"  # Change to your desired key pair name
  public_key = tls_private_key.key_pair_public_private.public_key_openssh
}


# Output the private key to a file
resource "local_file" "private_key" {
  filename = "private_key.pem"
  content  = tls_private_key.key_pair_public_private.private_key_pem
}


resource "aws_security_group" "security_group_tf" {
  description = "security group is created by terraform"
  vpc_id     = aws_vpc.custom_vpc_tf.id

  tags = {
    Name = "security group tf"
  }
  # Define inbound rules
  ingress {
    description = "Allow SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow HTTPS"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow ICMP"
    from_port   = -1
    to_port     = -1
    protocol    = "icmp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "Allow custom TCP port 8000"
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  // Define outbound rules (allow all traffic)
  egress {
    from_port       = 0
    to_port         = 0
    protocol        = "-1"
    cidr_blocks     = ["0.0.0.0/0"]
  }

}


# Public instance 
resource "aws_instance" "public_instance_tf" {
  tags = {
    Name = "Blog Instance"
  }
  #ami             = "ami-0f58b397bc5c1f2e8" 
  ami             = "ami-09edb498ada567cb6" 
  instance_type   = "t2.small"
  subnet_id       = aws_subnet.public_subnet.id
  security_groups = [aws_security_group.security_group_tf.id]
  key_name        = aws_key_pair.key_pair_tf.key_name
  associate_public_ip_address = true 

  # Define the root volume with 16GB size
  root_block_device {
    volume_size = 16
  }

  # Use remote-exec provisioner to update project setup from GitHub
  provisioner "remote-exec" {
    inline = [file("project_setup_script_without_docker_container.sh")]
    # inline = [file("project_setup_script_docker_container.sh")]

    connection {
      type        = "ssh"
      user        = "ubuntu"  # Update the user based on the AMI you're using
      private_key = tls_private_key.key_pair_public_private.private_key_pem
      host        = self.public_ip  # Use the public IP of the instance
    }
  }


}




