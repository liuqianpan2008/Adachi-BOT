const template =
`<div class="info box">
	<div class="text">
		<p class="info-title">{{ data.title }}</p>
		<p class="info-subtitle">{{ data.subtitle }}</p>
	</div>
	<p class="data">{{ data.numerator }}/{{ data.denominator }}</p>
</div>`;

const { defineComponent } = Vue;

export default defineComponent( {
	name: "NoteInfo",
	template,
	props: {
		data: Object
	}
} );