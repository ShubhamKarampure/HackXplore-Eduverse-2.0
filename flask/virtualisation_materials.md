---
marp: true
theme: default
paginate: true

---
### Virtualization

---
marp: true
theme: default
---
# Virtualization: An Introduction

*   **Topic:** Virtualization
*   **Description:** Explores the concept of virtualization and its importance in cloud computing.
*   **Attribution: 67e4cd88db95232462e03ed0

---
## What is Virtualization?

*   Separating hardware from software for improved system efficiency.
*   Allows multiple operating systems (guest OS) to run on the same hardware, independent of the host OS.
*   Enhances the use of compute engines, networks, and storage.
*   Gartner Report (2009): Virtualization was a top strategic technology.

---
## The Virtualization Layer

*   Achieved by adding a *virtualization layer* between the hardware and the operating system.
*   This layer is known as the **hypervisor** or **Virtual Machine Monitor (VMM)**.
*   The VMM converts real hardware into virtual hardware.
*   Enables different OS (e.g., Linux and Windows) to run simultaneously on the same physical machine.

---
## Levels of Virtualization Implementation

*   **Hardware Abstraction Level:** Virtualization directly on bare hardware.
    *   Creates a virtual hardware environment for VMs.
    *   Manages underlying hardware through virtualization.
    *   Aims to improve hardware utilization by multiple users concurrently.
    *   Example: Xen hypervisor for x86-based machines.

---
## Levels of Virtualization Implementation (cont.)

*   **Operating System Level:** Abstraction layer between the OS and user applications.
    *   Creates isolated containers on a single physical server.
    *   OS instances utilize the hardware.

---
## Hypervisor Architecture

*   Supports hardware-level virtualization on bare metal devices (CPU, memory, disk, network).
*   Hypervisor sits directly between the physical hardware and the OS.
*   Also known as VMM.

---
## Types of Virtualization Architectures

*   **Hypervisor Architecture:** Direct access to hardware.
*   **Paravirtualization:** Guest OS is modified to cooperate with the hypervisor.
*   **Host-Based Virtualization:** Virtualization layer runs on top of a host OS.

---
## Examples of Virtualization Technologies

*   **VMware Workstation:** Host-based virtualization.
*   **Xen:** Hypervisor for IA-32, x86-64, Itanium, and PowerPC 970 hosts.
*   **KVM (Kernel-based Virtual Machine):** Linux kernel virtualization infrastructure.
    *   Supports hardware-assisted virtualization (Intel VT-x or AMD-v).
    *   Supports paravirtualization (VirtIO framework).

---
## Benefits of Virtualization

*   Improved resource utilization.
*   Application flexibility.
*   Better system efficiency.
*   Enlarged memory space (virtual memory).

---
## Importance in Cloud Computing

*   Virtualization is fundamental to cloud computing.
*   Enables efficient resource allocation and management in cloud environments.
*   Supports the creation of virtual machines and containers, which are essential building blocks for cloud services.

