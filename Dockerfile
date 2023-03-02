# FROM nvidia/cuda:10.0-cudnn7-devel-ubuntu18.04
# FROM nvidia/cuda:10.1-cudnn7-devel-ubuntu18.04
# FROM nvidia/cuda:10.2-cudnn8-devel-ubuntu18.04
# FROM nvidia/cuda:11.1-cudnn8-devel-ubuntu20.04
# FROM nvidia/cuda:11.2-cudnn8-devel-ubuntu20.04
FROM nvidia/cuda:11.3.0-cudnn8-devel-ubuntu20.04


ENV DEBIAN_FRONTEND noninteractive

SHELL ["/bin/bash", "-c"]

# Time zone
ARG TIMEZONE="Asia/Tokyo"
RUN echo "timezone=${TIMEZONE}"
ENV TZ=$TIMEZONE
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime
RUN echo $TZ > /etc/timezone


# Set user name from argument
ARG USERNAME="root"
RUN echo "user=${USERNAME}"


# Prepare apt
RUN apt-get update && \
    apt-get install -y apt-file && \
    apt-file update


# Enable sudo
RUN apt-get install -y sudo && \
    mkdir -p /etc/sudoers.d && \
    useradd -m ${USERNAME} && \
    echo "${USERNAME}:${USERNAME}" | chpasswd && \
    usermod --shell /bin/bash ${USERNAME} && \
    usermod -aG sudo ${USERNAME} && \
    usermod -aG video ${USERNAME} && \
    usermod -aG audio ${USERNAME} && \
    echo "${USERNAME} ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers.d/${USERNAME} && \
    chmod 0440 /etc/sudoers.d/${USERNAME} && \
    # Replace 1000 with your user/group id
    usermod  --uid 1000 ${USERNAME} && \
    groupmod --gid 1000 ${USERNAME}


# Set env for user
USER ${USERNAME}
WORKDIR /home/${USERNAME}
ENV HOME /home/$USERNAME


# Install Basic tools
RUN sudo apt-get update && \
    sudo apt-get install -y \
      git \
      wget \
      curl \
      vim \
      tmux \
      x11-apps


# Install network tools
RUN sudo apt-get update && \
    sudo apt-get install -y \
      iputils-ping \
      net-tools \
      dnsutils \
      iproute2

# Install graphics tools
RUN sudo apt-get update && \
    sudo apt-get install -y libgtk-3-dev


# Japanese environment
ENV LANGUAGE ja_JP.UTF-8
ENV LANG ja_JP.UTF-8
RUN sudo apt-get install -y --no-install-recommends locales && \
    sudo locale-gen ja_JP.UTF-8 && \
    sudo apt-get install -y --no-install-recommends fonts-ipafont


# Install node on nodev
RUN git clone https://github.com/nodenv/nodenv.git ~/.nodenv
RUN git clone https://github.com/nodenv/node-build.git ~/.nodenv/plugins/node-build
RUN echo 'export PATH="$HOME/.nodenv/bin:$PATH"' >> ~/.bashrc
RUN echo 'eval "$(nodenv init -)"' >> ~/.bashrc
RUN ~/.nodenv/bin/nodenv install 16.13.0
RUN ~/.nodenv/bin/nodenv global 16.13.0 
RUN ~/.nodenv/shims/npm install -g npm


WORKDIR /home/${USERNAME}/share
