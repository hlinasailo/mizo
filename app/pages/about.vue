<template>
	<div :class="$style.aboutPage">
		<!-- Section 1: Hero/Introduction - Dark -->
		<section class="relative bg-zinc-900 text-white py-20 md:py-32 overflow-hidden">
			<!-- Animated background elements -->
			<div class="absolute inset-0 overflow-hidden">
				<div :class="$style.floatingCircles">
					<div :class="[$style.circle, $style.circle1]" />
					<div :class="[$style.circle, $style.circle2]" />
					<div :class="[$style.circle, $style.circle3]" />
				</div>
			</div>

			<div class="container mx-auto px-6 md:px-12 relative z-10">
				<div class="max-w-4xl mx-auto text-center" :class="$style.fadeInUp" data-animate>
					<h1 class="font-black tracking-tighter leading-[1] uppercase text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] mb-6">
						About <span class="text-zinc-200">MizoMade</span>
					</h1>
					<div class="w-24 h-1 bg-zinc-200 mx-auto mb-8" />
					<p class="text-lg md:text-xl text-zinc-200 leading-relaxed">
						Founded in 2019, MizoMade.com is an online Mizo web community where people can share articles and blogs that may enrich the society with new ideas and knowledge.
					</p>
				</div>
			</div>

			<!-- Scroll indicator -->
			<div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
				<svg class="w-6 h-6 text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
				</svg>
			</div>
		</section>

		<!-- Section 2: Mission & Purpose - Light -->
		<section class="bg-zinc-700 text-white py-20 md:py-32">
			<div class="container mx-auto px-6 md:px-12">
				<div class="max-w-6xl mx-auto">
					<div class="grid md:grid-cols-2 gap-6 items-stretch">
						<!-- Left: Content -->
						<div class="bg-white/70 backdrop-blur-md p-8 md:p-10" :class="$style.slideInLeft" data-animate>
						<h2 class="font-black tracking-tighter leading-[1] uppercase text-3xl sm:text-4xl md:text-5xl lg:text-4xl mb-6 text-zinc-900">
								Our Mission
							</h2>
							<div class="w-20 h-1 bg-zinc-700 mb-6" />
							<p class="text-lg text-zinc-900 leading-relaxed mb-6">
								The goal is to share one's knowledge and experiences through our web blog community. We believe in the power of collective wisdom and community-driven content.
							</p>
							<p class="text-lg text-zinc-900 leading-relaxed">
								As only a small portion of the Mizo community is technologically literate and almost 60% of the Mizo population does not know how to use a website, the resources available to the people are very limited, resulting in unequal resource availability.
							</p>
						</div>

						<!-- Right: Feature Cards -->
						<div class="bg-zinc-900 p-8 md:p-10" :class="$style.slideInRight" data-animate>
							<h3 class="font-black tracking-tighter leading-[1] uppercase text-3xl sm:text-4xl md:text-5xl lg:text-4xl mb-6 text-zinc-100">What We Focus On</h3>
							<div class="space-y-6">
								<div :class="[$style.featureCard, 'group']" data-animate>
									<div class="flex items-start space-x-4">
										<div class="flex-shrink-0">
											<div class="w-12 h-12 bg-zinc-700 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
												<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
												</svg>
											</div>
										</div>
										<div>
											<h3 class="text-xl font-semibold mb-2 text-zinc-100">Knowledge Sharing</h3>
											<p class="text-zinc-300">Empowering the community through shared experiences and insights</p>
										</div>
									</div>
								</div>

								<div :class="[$style.featureCard, 'group']" data-animate>
									<div class="flex items-start space-x-4">
										<div class="flex-shrink-0">
											<div class="w-12 h-12 bg-zinc-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
												<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
												</svg>
											</div>
										</div>
										<div>
											<h3 class="text-xl font-semibold mb-2 text-zinc-100">Language Accessibility</h3>
											<p class="text-zinc-300">Breaking language barriers with content in Mizo</p>
										</div>
									</div>
								</div>

								<div :class="[$style.featureCard, 'group']" data-animate>
									<div class="flex items-start space-x-4">
										<div class="flex-shrink-0">
											<div class="w-12 h-12 bg-zinc-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
												<svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
												</svg>
											</div>
										</div>
										<div>
											<h3 class="text-xl font-semibold mb-2 text-zinc-100">Community First</h3>
											<p class="text-zinc-300">Built by the community, for the community</p>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Section 3: Design Philosophy - Light Gray -->
		<section class="bg-zinc-950 text-white py-20 md:py-32">
			<div class="container mx-auto px-6 md:px-12">
				<div class="max-w-5xl mx-auto text-center" :class="$style.fadeInUp" data-animate>
					<h2 class="font-black tracking-tighter leading-[1] uppercase text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] mb-6 text-white">
						Designed for 
					</h2>
					<h2 class="text-zinc-700 font-black tracking-tighter leading-[1] uppercase text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] mb-6 text-white">
						 Everyone
					</h2>
					<div class="w-20 h-1 bg-zinc-300 mx-auto mb-8" />
					<p class="text-lg md:text-xl text-zinc-300 leading-relaxed mb-12">
						Since many online contents are written in languages other than Mizo, the language barrier has set a bigger barrier among the people to even learn how to work around it.
					</p>

					<!-- Stats/Features Grid -->
					<div class="grid md:grid-cols-3 gap-8 mt-16">
						<div :class="$style.statCard" data-animate>
							<div class="text-5xl md:text-6xl font-bold text-zinc-800 mb-4">100%</div>
							<h3 class="text-xl font-semibold mb-2 text-zinc-800">Free Access</h3>
							<p class="text-zinc-800">All resources completely free for everyone</p>
						</div>

						<div :class="$style.statCard" data-animate>
							<div class="text-5xl md:text-6xl font-bold text-zinc-800 mb-4">
								<svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h3 class="text-xl font-semibold mb-2 text-zinc-800">Minimalistic</h3>
							<p class="text-zinc-800">Intuitive design for easy navigation</p>
						</div>

						<div :class="$style.statCard" data-animate>
							<div class="text-5xl md:text-6xl font-bold text-zinc-800 mb-4">
								<svg class="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<h3 class="text-xl font-semibold mb-2 text-zinc-800">Inclusive</h3>
							<p class="text-zinc-800">Accessible to non-sophisticated users</p>
						</div>
					</div>
				</div>
			</div>
		</section>

		<!-- Section 4: Vision & Contact - Dark -->
		<section class="relative bg-zinc-900 text-white py-20 md:py-32 overflow-hidden">
			<!-- Animated background pattern -->
			<div class="absolute inset-0 opacity-10">
				<div :class="$style.gridPattern" />
			</div>

			<div class="container mx-auto px-6 md:px-12 relative z-10">
				<div class="max-w-4xl mx-auto">
					<!-- Vision Statement -->
					<div class="text-center mb-16" :class="$style.fadeInUp" data-animate>
						<h2 class="font-black tracking-tighter leading-[1] uppercase text-5xl sm:text-6xl md:text-7xl lg:text-[5rem] mb-6">Our Vision</h2>
						<div class="w-20 h-1 bg-zinc-200 mx-auto mb-8" />
						<p class="text-lg md:text-xl text-zinc-300 leading-relaxed">
							MizoMade.com is designed with a minimalistic and intuitive approach so that even non-sophisticated users may know how to utilize the resources. We envision a future where every member of the Mizo community has equal access to knowledge and digital resources, regardless of their technical literacy.
						</p>
					</div>

					<!-- Location only -->
					<div class="flex items-center justify-center text-zinc-300" :class="$style.slideInUp" data-animate>
						<div class="flex items-center space-x-3">
							<svg class="w-6 h-6 text-zinc-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
							</svg>
							<span class="text-lg md:text-xl">Aizawl, Mizoram 796001</span>
						</div>
					</div>

					<!-- Footer Tagline -->
					<div class="text-center mt-16" :class="$style.fadeInUp" data-animate>
						<p class="text-xl md:text-2xl font-light text-zinc-400 italic">
							"Empowering the Mizo community through accessible knowledge sharing"
						</p>
					</div>
				</div>
			</div>
		</section>
	</div>
</template>

<script setup>
import { onBeforeUnmount, onMounted } from 'vue';

let observer;

onMounted(() => {
	const observerOptions = {
		threshold: 0.1,
		rootMargin: '0px 0px -50px 0px'
	};

	observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				entry.target.classList.add('visible');
			}
		});
	}, observerOptions);

	document.querySelectorAll('[data-animate]').forEach((el) => {
		observer.observe(el);
	});
});

onBeforeUnmount(() => {
	observer?.disconnect();
});
</script>

<style module>
.aboutPage {
	scroll-behavior: smooth;
}

.fadeInUp {
	opacity: 0;
	transform: translateY(30px);
	transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.slideInLeft {
	opacity: 0;
	transform: translateX(-50px);
	transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.slideInRight {
	opacity: 0;
	transform: translateX(50px);
	transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.slideInUp {
	opacity: 0;
	transform: translateY(40px);
	transition: opacity 0.8s ease-out, transform 0.8s ease-out;
}

.featureCard {
	opacity: 0;
	transform: translateY(20px);
	transition: all 0.6s ease-out;
	padding: 1.5rem;
	background: rgba(39, 39, 42, 0.55);
	border: 1px solid rgba(161, 161, 170, 0.25);
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.featureCard:hover {
	box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
	transform: translateY(-5px);
}

.statCard {
	opacity: 0;
	transform: scale(0.9);
	transition: all 0.6s ease-out;
	padding: 2rem;
	border-radius: 0;
	background: rgba(219, 219, 219, 0.67);
	border: 1px solid rgba(161, 161, 170, 0.2);
	box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.statCard:hover {
	box-shadow: 0 15px 35px rgba(0, 0, 0, 0.35);
	transform: translateY(-10px) scale(1.02);
}

.floatingCircles {
	position: absolute;
	width: 100%;
	height: 100%;
	overflow: hidden;
}

.circle {
	position: absolute;
	border-radius: 50%;
	background: linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(161, 161, 170, 0.1));
	animation: float 20s infinite ease-in-out;
}

.circle1 {
	width: 300px;
	height: 300px;
	top: 10%;
	left: 10%;
	animation-delay: 0s;
}

.circle2 {
	width: 200px;
	height: 200px;
	top: 60%;
	right: 10%;
	animation-delay: 5s;
}

.circle3 {
	width: 250px;
	height: 250px;
	bottom: 10%;
	left: 50%;
	animation-delay: 10s;
}

.gridPattern {
	width: 100%;
	height: 100%;
	background-image:
		linear-gradient(rgba(255, 255, 255, 0.08) 1px, transparent 1px),
		linear-gradient(90deg, rgba(255, 255, 255, 0.08) 1px, transparent 1px);
	background-size: 50px 50px;
	animation: gridMove 20s linear infinite;
}

.ctaButton {
	position: relative;
	overflow: hidden;
}

.ctaButton::before {
	content: '';
	position: absolute;
	top: 50%;
	left: 50%;
	width: 0;
	height: 0;
	border-radius: 50%;
	background: rgba(255, 255, 255, 0.2);
	transform: translate(-50%, -50%);
	transition: width 0.6s, height 0.6s;
}

.ctaButton:hover::before {
	width: 300px;
	height: 300px;
}

@keyframes float {
	0%,
	100% {
		transform: translate(0, 0) rotate(0deg);
	}

	33% {
		transform: translate(30px, -30px) rotate(120deg);
	}

	66% {
		transform: translate(-30px, 30px) rotate(240deg);
	}
}

@keyframes gridMove {
	0% {
		transform: translate(0, 0);
	}

	100% {
		transform: translate(50px, 50px);
	}
}

:global(.visible) {
	opacity: 1;
	transform: translateX(0) translateY(0) scale(1);
}

@media (max-width: 768px) {
	.circle {
		width: 150px !important;
		height: 150px !important;
	}
}
</style>
