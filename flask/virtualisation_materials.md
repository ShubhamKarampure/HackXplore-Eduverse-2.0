---
marp: true
theme: gaia
paginate: true
backgroundColor: "#1E1E2E"
color: white

---
### Virtualization

---
### Virtualization: An Introduction (T123)

*   **Topic:** Virtualization
*   **Description:** Exploring the concept of virtualization and its importance in cloud computing.
*   **Source:** Based on provided reference materials.

---
### What is Virtualization? (T123)

*   Separating hardware from software for improved system efficiency.
*   Allows multiple operating systems (guest OS) to run on the same hardware, independent of the host OS.
*   Enhances the use of compute engines, networks, and storage.
*   Gartner Report (2009): Virtualization was a top strategic technology.

---
### The Virtualization Layer (T123)

*   Additional software layer called the **hypervisor** or **Virtual Machine Monitor (VMM)**.
*   Manages VMs and allocates resources.
*   Responsible for converting real hardware into virtual hardware.
*   Enables different OS (e.g., Linux, Windows) to run simultaneously on the same physical machine.

---
### Levels of Virtualization Implementation (T123)

*   **Traditional Computer:** Host OS tailored for hardware architecture.
*   **After Virtualization:** Guest OS managed by their own applications, running on the same hardware.
*   **Key Component:** Virtualization layer (Hypervisor/VMM).

---
### Hypervisor Architecture (T123)

*   Supports **hardware-level virtualization** on bare metal.
*   Sits directly between physical hardware and the OS.
*   Manages CPU, memory, disk, and network interfaces.

---
### Hypervisor and Xen Architecture (T123)

*   Hypervisor software sits directly between the physical hardware and its OS.
*   This virtualization layer is referred to as either the VMM or the hypervisor.

---
### Hardware Abstraction Level (T123)

*   Virtualization performed directly on top of the bare hardware.
*   Creates a virtual hardware environment for a VM.
*   Manages underlying hardware through virtualization.
*   Aims to upgrade hardware utilization rate by multiple users concurrently.
*   Example: Xen hypervisor virtualizing x86-based machines.

---
### Operating System Level Virtualization (T123)

*   Abstraction layer between traditional OS and user applications.
*   Creates isolated containers on a single physical server.
*   OS instances utilize the hardware.

---
### Importance in Cloud Computing (T123)

*   Enables resource sharing and isolation.
*   Supports the creation of virtual clusters dedicated to different tenants.
*   Critical for cloud infrastructure and service delivery.

---
### Further Reading (T123)

*   Rosenblum, et al. [53,54]
*   Smith and Nair [58,59]
*   VMware white papers [71,72]
*   Xen hypervisor [7,13,42]
*   KVM [31]

